import {
  ACESFilmicToneMapping,
  BackSide,
  BoxGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Scene as ThreeScene,
  WebGLRenderer,
} from "three";
import { ThemeBinder } from "./palette";
import { World, chapterAt, type ChapterId } from "./world";
import { buildScheme, type M3Mode } from "@/lib/m3/theme";

/**
 * FilmEngine — owns the one persistent WebGL renderer for the whole journey.
 *
 * Responsibilities:
 *  - renderer lifecycle, DPR cap + adaptive quality, resize
 *  - a single rAF loop; the ONLY consumer of scroll progress
 *  - progress smoothing (filmic settle; disabled under reduced motion)
 *  - theme propagation: M3/HCT scheme → ThemeBinder → world textures
 *  - deterministic teardown (context loss, unmount, HMR)
 *
 * The engine never touches React state. React never touches the render loop.
 */

export interface FilmEngineOptions {
  source: string;
  mode: M3Mode;
  reducedMotion: boolean;
  onChapter?: (chapter: number) => void;
  onContextLost?: () => void;
}

const damp = (cur: number, target: number, lambda: number, dt: number) =>
  cur + (target - cur) * (1 - Math.exp(-lambda * dt));

export class FilmEngine {
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;
  private binder: ThemeBinder;
  private world: World;
  private pmrem: PMREMGenerator | null = null;
  private clock = { last: 0 };
  private raf = 0;
  private running = false;
  private disposed = false;

  private progress = 0;
  private smoothed = 0;
  private lastChapter = -1;
  private reducedMotion: boolean;

  /* adaptive quality */
  private dprCap: number;
  private dprStage = 0;
  private dtAvg = 16;
  private frames = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private opts: FilmEngineOptions
  ) {
    this.reducedMotion = opts.reducedMotion;
    this.dprCap = Math.min(window.devicePixelRatio || 1, 1.75);

    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.setPixelRatio(this.dprCap);

    this.camera = new PerspectiveCamera(50, 1, 0.1, 700);
    this.camera.position.set(0.4, 0.55, 6.6);

    this.binder = new ThemeBinder(opts.source, opts.mode);
    this.world = new World(this.binder);

    /* environment for believable metal response — an AUTHORED dark studio:
       RoomEnvironment's irradiance is enormous and washes every shot gray */
    try {
      this.pmrem = new PMREMGenerator(this.renderer);
      const env = this.pmrem.fromScene(buildStudioEnvironment(), 0.09).texture;
      this.world.root.environment = env;
      this.world.root.environmentIntensity = 1.0;
    } catch {
      /* environment is an enhancement, not a requirement */
    }

    const scene = this.world.root;
    scene.background = this.binder.backgroundColor;
    scene.fog = this.binder.fog;
    scene.add(this.camera);

    canvas.addEventListener("webglcontextlost", this.onContextLost);
    this.resize();
    window.addEventListener("resize", this.resize, { passive: true });
  }

  /* ------------------------- public API ------------------------- */

  /** Raw journey progress 0..1 — written by the scroll subscriber. */
  setProgress(p: number): void {
    this.progress = Math.min(1, Math.max(0, p));
  }

  setTheme(source: string, mode: M3Mode): void {
    this.binder.setTheme(source, mode);
    this.world.setScheme(this.binder.current);
  }

  start(): void {
    if (this.running || this.disposed) return;
    this.running = true;
    this.clock.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  resize = (): void => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  };

  dispose(): void {
    this.disposed = true;
    this.stop();
    window.removeEventListener("resize", this.resize);
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.pmrem?.dispose();
    this.world.root.traverse((obj) => {
      const mesh = obj as unknown as {
        geometry?: { dispose(): void };
        material?: { dispose(): void; map?: { dispose(): void } };
      };
      mesh.geometry?.dispose?.();
      const m = mesh.material;
      if (m) {
        m.map?.dispose?.();
        m.dispose?.();
      }
    });
    this.renderer.dispose();
  }

  private onContextLost = (e: Event): void => {
    e.preventDefault();
    this.stop();
    this.opts.onContextLost?.();
  };

  /* ------------------------- render loop ------------------------- */

  private frame = (): void => {
    if (!this.running || this.disposed) return;
    const now = performance.now();
    const dt = Math.min((now - this.clock.last) / 1000, 0.05);
    this.clock.last = now;

    /* filmic settle on the journey input; direct under reduced motion */
    this.smoothed = this.reducedMotion
      ? this.progress
      : damp(this.smoothed, this.progress, 8.5, dt);

    /* camera = pure function of smoothed journey */
    const s = this.world.rail.eval(this.smoothed);
    this.camera.position.copy(s.pos);
    this.camera.lookAt(s.look);
    this.camera.rotateZ(s.roll);
    if (Math.abs(this.camera.fov - s.fov) > 0.01) {
      this.camera.fov = s.fov;
      this.camera.updateProjectionMatrix();
    }

    this.world.update(this.smoothed, dt);
    this.binder.update(dt);
    this.renderer.render(this.world.root, this.camera);

    /* chapter notification (coarse — React re-renders only at boundaries) */
    const ch = chapterAt(this.smoothed);
    if (ch !== this.lastChapter) {
      this.lastChapter = ch;
      this.opts.onChapter?.(ch);
    }

    this.govern(dt);
    this.raf = requestAnimationFrame(this.frame);
  };

  /** Step the pixel ratio down if the device can't hold the frame budget. */
  private govern(dt: number): void {
    this.dtAvg = this.dtAvg * 0.95 + dt * 1000 * 0.05;
    this.frames++;
    if (this.frames < 90 || this.dprStage >= 2) return;
    if (this.dtAvg > 34) {
      this.dprStage++;
      const dpr = this.dprStage === 1 ? Math.min(1.25, this.dprCap) : 1;
      this.renderer.setPixelRatio(dpr);
      this.frames = 0;
    }
  }
}

/**
 * The Zyntrix lighting environment: a near-black room with three authored
 * softboxes (cool key strip, warm counter strip, overhead softbox) and a dim
 * floor bounce. Gives metals believable, restrained reflections without
 * irradiating the entire world.
 */
function buildStudioEnvironment(): ThreeScene {
  const scene = new ThreeScene();
  scene.background = new Color(0x030305);
  const panel = (
    size: [number, number, number],
    color: [number, number, number],
    pos: [number, number, number],
    face: [number, number, number]
  ) => {
    const m = new Mesh(
      new BoxGeometry(...size),
      new MeshBasicMaterial({ color: new Color(...color), side: BackSide })
    );
    m.position.set(...pos);
    m.lookAt(...face);
    scene.add(m);
  };
  /* overhead softbox, slightly camera-side */
  panel([7, 0.35, 4.5], [2.6, 2.6, 3.0], [0, 6.5, 4], [0, 0, 0]);
  /* cool strip, camera-left */
  panel([0.5, 6, 3], [0.85, 1.0, 1.7], [-7.5, 3, 2.5], [0, 1, 0]);
  /* warm counter strip, back-right */
  panel([0.5, 5, 2.4], [1.7, 0.95, 1.25], [7.5, 2.5, -4.5], [0, 1, 0]);
  /* dim floor bounce */
  panel([11, 0.3, 11], [0.2, 0.18, 0.24], [0, -5, 0], [0, 0, 0]);
  return scene;
}

/** Capability probe — cheap, honest. */
export function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export type { ChapterId };
export { buildScheme };
