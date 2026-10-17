import {
  Box3,
  CylinderGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  SphereGeometry,
  SpotLight,
  TorusGeometry,
  Vector3,
  type Object3D,
} from "three";
import { ThemeBinder, darkPolymer, emissiveRole, machinedMetal, mixRoles } from "../palette";
import { makeShadowTexture } from "../textures";
import { loadGLB } from "../loaders";
import { toneToHex, type M3Scheme } from "@/lib/m3/theme";

/** Machined graphite for the real gear teeth — semi-metallic so the face
 *  reads under the studio lights instead of mirroring the black room. */
function brushedSteel(binder: ThemeBinder): MeshStandardMaterial {
  return binder.material(
    new MeshStandardMaterial({
      color: "#8d8d97",
      metalness: 0.42,
      roughness: 0.5,
      envMapIntensity: 1.2,
    }),
    (s: M3Scheme) => toneToHex(s.palettes.neutral, s.mode === "dark" ? 64 : 84)
  );
}

/**
 * REAL HARDWARE — production-grade GLTF models woven into the film.
 *
 * Four real, high-detail models anchor four chapters (all local assets,
 * DRACO-decoded in-process; the procedural world remains fully functional
 * if any of them fails to load):
 *
 *   02  THE THEME ENGINE       — machined gear train flanking the runway
 *                                (gears.glb — brushed steel, theme-bound)
 *   03  THE INSTRUMENT CHAMBER — the ShaderBall calibration instrument,
 *                                backdrop re-bound to the live surface role
 *   05  THE PRODUCT FILM       — a vintage cinema camera on a tripod, aimed
 *                                at the live Plasma display (steampunk_camera)
 *   08  THE REVEAL             — an iridescent desk lamp warming the finished
 *                                workstation (IridescenceLamp.glb)
 *
 * Every motion is a pure function of journey progress (scrub-safe, both
 * directions); visibility is gated per chapter so nothing off-camera costs
 * draw calls. All accent colors bind through the ThemeBinder — nothing
 * hardcodes a theme color.
 */

/* Journey visibility windows (with generous travel margins) */
const WIN = {
  gears: [0.14, 0.43],
  ball: [0.34, 0.54],
  filmCamera: [0.46, 0.74],
  lamp: [0.86, 1.02],
} as const;

type ShadowTex = ReturnType<typeof makeShadowTexture>;

interface PropUnit {
  root: Group;
  window: readonly [number, number];
  update?: (journey: number, dt: number) => void;
}

export interface PropsRig {
  group: Group;
  load(): Promise<void>;
  cancel(): void;
  update(journey: number, dt: number): void;
}

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

/** Uniformly scale `obj` so its largest dimension == target, center on
 *  origin (x/z) and rest exactly on y=0. Returns the post-transform size. */
function normalize(obj: Object3D, target: number): Vector3 {
  obj.updateWorldMatrix(true, true);
  const box = new Box3().setFromObject(obj);
  const size = box.getSize(new Vector3());
  const s = target / Math.max(size.x, size.y, size.z, 1e-6);
  obj.scale.multiplyScalar(s);
  obj.updateWorldMatrix(true, true);
  const box2 = new Box3().setFromObject(obj);
  const center = box2.getCenter(new Vector3());
  obj.position.x -= center.x;
  obj.position.z -= center.z;
  obj.position.y -= box2.min.y;
  obj.updateWorldMatrix(true, true);
  return box2.getSize(new Vector3());
}

/** Give GLTF-sourced PBR materials a believable response to the authored
 *  studio environment (they arrive authored for bright IBLs). */
function tuneEnv(root: Object3D, intensity: number): void {
  root.traverse((o) => {
    const m = (o as Mesh).material as MeshStandardMaterial | undefined;
    if (m && m.isMeshStandardMaterial) {
      m.envMapIntensity = intensity;
      m.needsUpdate = true;
    }
  });
}

/** Authored contact shadow (the world uses no shadow maps). */
function contactOn(
  shadowTex: ShadowTex,
  parent: Group,
  w: number,
  d: number,
  x: number,
  y: number,
  z: number,
  opacity: number
): void {
  const m = new Mesh(
    new PlaneGeometry(w, d),
    new MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity,
      depthWrite: false,
    })
  );
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, y, z);
  m.renderOrder = 2;
  parent.add(m);
}

/* ------------------------------------------------------------------ */
/* builders                                                            */
/* ------------------------------------------------------------------ */

/** 02 — machined gear train beside the runway on the approach to the arcs. */
function buildGearTrain(gltf: NonNullable<Awaited<ReturnType<typeof loadGLB>>>, binder: ThemeBinder, shadowTex: ShadowTex): PropUnit {
  const root = new Group();

  const steel = brushedSteel(binder);
  const axleMat = machinedMetal(binder);
  const hullMat = darkPolymer(binder);

  const src = gltf.scene;
  const spinners: { node: Object3D; rate: number; phase: number }[] = [];

  const units = [
    /* fly-over gear — just off the runway at the corridor mouth; the camera
       descends right over its teeth */
    { scale: 0.22, x: 1.0, z: -77.4, aim: [-1.0, 4.0], rate: 30, ph: 0.55 },
    /* deep-left sentry past the arcs */
    { scale: 0.3, x: -2.4, z: -88.5, aim: [1.8, 4.0], rate: -26, ph: 0.85 },
    /* the core gear — waiting where the arcs converge */
    { scale: 0.52, x: 1.5, z: -94, aim: [-1.2, 2.4], rate: 15, ph: 0.3 },
  ] as const;

  /* permanent authored key light over the core gear — always in scene so
     toggling prop visibility never triggers shader recompiles */
  const gearKey = new SpotLight(0xffffff, 230, 18, 0.6, 0.55, 1.8);
  gearKey.position.set(0.9, 5.8, -89.5);
  gearKey.target.position.set(1.5, 1.2, -94);
  binder.color(gearKey.color, (s) => mixRoles("onSurface", "primaryContainer", 0.2)(s));
  root.add(gearKey, gearKey.target);

  for (const u of units) {
    const g = new Group();

    /* plinth + theme accent ring */
    const r = 5.8 * u.scale * 0.5 + 0.32;
    const plinth = new Mesh(new CylinderGeometry(r, r * 1.12, u.ph, 40), hullMat);
    plinth.position.y = u.ph / 2;
    g.add(plinth);
    const ring = new Mesh(
      new TorusGeometry(r * 0.82, 0.028, 10, 48),
      emissiveRole(binder, (s) => s.roles.primary, 1.05)
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = u.ph + 0.005;
    g.add(ring);

    /* the real gear assembly, scaled to this pedestal */
    const asm = src.clone(true);
    asm.traverse((o) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      mesh.material =
        mesh.name === "gears" ? steel : mesh.name === "axle" ? axleMat : hullMat;
    });
    normalize(asm, 5.8 * u.scale);
    asm.position.y = u.ph + 2.9 * u.scale * 0.62;
    g.add(asm);
    g.position.set(u.x, 0, u.z);
    g.lookAt(u.x + u.aim[0], 0, u.z + u.aim[1]);
    g.rotateY(Math.PI);
    root.add(g);

    spinners.push({ node: asm, rate: u.rate, phase: u.x });
    contactOn(shadowTex, root, r * 2.6, r * 2.6, u.x, 0.012, u.z, 0.4);
  }

  return {
    root,
    window: WIN.gears,
    update(journey) {
      /* pure f(journey) — bidirectional scrubbing replays exactly */
      for (const s of spinners) s.node.rotation.z = journey * s.rate + s.phase;
    },
  };
}

/** 03 — the ShaderBall calibration instrument inside the chamber. */
function buildShaderBall(gltf: NonNullable<Awaited<ReturnType<typeof loadGLB>>>, binder: ThemeBinder): PropUnit {
  const root = new Group();

  const plinth = new Mesh(new CylinderGeometry(0.92, 1.06, 1.0, 48), machinedMetal(binder));
  plinth.position.set(2.75, 0.5, -145.2);
  root.add(plinth);

  const ring = new Mesh(
    new TorusGeometry(0.78, 0.03, 10, 48),
    emissiveRole(binder, (s) => s.roles.tertiary, 1.0)
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(2.75, 1.01, -145.2);
  root.add(ring);

  /* calibration backdrop re-bound to the live surface role — the instrument
     literally displays the theme's own surface tone */
  const calibrationMat = binder.material(
    new MeshStandardMaterial({ metalness: 0.04, roughness: 0.62, envMapIntensity: 0.6 }),
    (s: M3Scheme) => toneToHex(s.palettes.neutral, s.mode === "dark" ? 30 : 84)
  );

  /* the ball itself becomes THE theme material — primary-tinted chrome with
     a clearcoat finish, reflecting the authored studio environment */
  const ballMat = new MeshPhysicalMaterial({
    metalness: 0.92,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.5,
  });
  binder.material(ballMat, mixRoles("primary", "surfaceContainerHighest", 0.45));

  const turntable = new Group();
  turntable.position.set(2.75, 1.0, -145.2);
  const model = gltf.scene;
  normalize(model, 1.62);
  model.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    if (mesh.name === "Calibration_Mesh") mesh.material = calibrationMat;
    if (mesh.name === "Preview_Mesh") mesh.material = ballMat;
  });
  turntable.add(model);
  root.add(turntable);

  return {
    root,
    window: WIN.ball,
    update(journey) {
      /* deterministic showcase turntable across the chapter */
      const local = MathUtils.smoothstep(journey, WIN.ball[0], WIN.ball[0] + 0.12);
      turntable.rotation.y = local * Math.PI * 1.6;
    },
  };
}

/** 05 — a vintage cinema camera on a tripod, framing the live display. */
function buildFilmCamera(gltf: NonNullable<Awaited<ReturnType<typeof loadGLB>>>, binder: ThemeBinder, shadowTex: ShadowTex): PropUnit {
  const root = new Group();

  const metal = machinedMetal(binder);
  const poly = darkPolymer(binder);

  const unit = new Group();
  unit.position.set(4.45, 0, -210.4);

  /* tripod — three splayed legs + head */
  const legGeo = new CylinderGeometry(0.035, 0.05, 1.9, 10);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    const leg = new Mesh(legGeo, metal);
    leg.position.set(Math.sin(a) * 0.34, 0.86, Math.cos(a) * 0.34);
    leg.rotation.set(Math.cos(a) * 0.22, 0, -Math.sin(a) * 0.22);
    unit.add(leg);
  }
  const hub = new Mesh(new CylinderGeometry(0.12, 0.14, 0.16, 20), poly);
  hub.position.y = 1.68;
  unit.add(hub);
  const mount = new Mesh(new CylinderGeometry(0.07, 0.07, 0.34, 14), metal);
  mount.position.y = 1.9;
  unit.add(mount);

  /* the real camera */
  const cam = gltf.scene;
  tuneEnv(cam, 1.15);
  normalize(cam, 1.02);
  cam.position.y = 2.07;
  unit.add(cam);
  unit.lookAt(0, 3.05, -214);
  unit.rotateY(Math.PI);

  /* tally light — a quiet nod to "recording" */
  const tally = new Mesh(
    new SphereGeometry(0.045, 14, 12),
    emissiveRole(binder, (s) => s.roles.error, 1.6)
  );
  tally.position.set(0.3, 2.55, 0.32);
  unit.add(tally);

  root.add(unit);
  contactOn(shadowTex, root, 2.1, 2.1, 4.45, 0.012, -210.4, 0.42);

  return { root, window: WIN.filmCamera };
}

/** 08 — an iridescent desk lamp warming the finished workstation. */
function buildDeskLamp(gltf: NonNullable<Awaited<ReturnType<typeof loadGLB>>>, binder: ThemeBinder, shadowTex: ShadowTex): PropUnit {
  const root = new Group();

  const unit = new Group();
  const deskTop = 0.33; /* station desk surface, world Y (station raised +3.255) */
  /* placed to silhouette against the live display — a dark glass lamp on a
     2%-albedo desk against black void reads as nothing; against the glowing
     screen it reads as a lamp */
  unit.position.set(-5.75, deskTop, -429.9);
  unit.rotation.y = 0.35; /* shade faces the arrival camera */

  const model = gltf.scene;
  tuneEnv(model, 1.0);
  normalize(model, 1.85);
  unit.add(model);

  /* the bulb — a real emitter; its bloom halo carries the read at distance */
  const bulb = new Mesh(
    new SphereGeometry(0.12, 16, 14),
    emissiveRole(binder, (s) => mixRoles("onSurface", "primaryContainer", 0.4)(s), 9)
  );
  bulb.position.y = 1.35;
  unit.add(bulb);

  /* warm pool of light painted onto the desk below the shade — the desk is
     near-black, so this needs real punch to read at reveal distance */
  const pool = new SpotLight(0xffffff, 60, 10, 0.72, 0.6, 1.4);
  pool.position.set(0, 1.3, 0.15);
  pool.target.position.set(0, -0.4, 0.5);
  binder.color(pool.color, (s) => mixRoles("onSurface", "primaryContainer", 0.45)(s));
  unit.add(pool);
  unit.add(pool.target);

  /* soft ambient glow so the shade itself reads */
  const glow = new PointLight(0xffffff, 4, 6, 1.6);
  glow.position.set(0, 1.2, 0.2);
  binder.color(glow.color, (s) => mixRoles("onSurface", "primaryContainer", 0.3)(s));
  unit.add(glow);

  root.add(unit);
  contactOn(shadowTex, root, 1.9, 1.9, -5.75, deskTop + 0.012, -429.9, 0.32);

  return { root, window: WIN.lamp };
}

/* ------------------------------------------------------------------ */
/* rig                                                                 */
/* ------------------------------------------------------------------ */

export function buildRealProps(binder: ThemeBinder): PropsRig {
  const group = new Group();
  group.name = "real-props";
  const units: PropUnit[] = [];
  const shadowTex = makeShadowTexture();
  let cancelled = false;

  async function load(): Promise<void> {
    const [gears, ball, camera, lamp] = await Promise.all([
      loadGLB("/models/gears.glb"),
      loadGLB("/models/ShaderBall.glb"),
      loadGLB("/models/steampunk_camera.glb"),
      loadGLB("/models/IridescenceLamp.glb"),
    ]);
    if (cancelled) return;
    if (gears) units.push(buildGearTrain(gears, binder, shadowTex));
    if (ball) units.push(buildShaderBall(ball, binder));
    if (camera) units.push(buildFilmCamera(camera, binder, shadowTex));
    if (lamp) units.push(buildDeskLamp(lamp, binder, shadowTex));
    if (cancelled) return;
    for (const u of units) {
      u.root.visible = false;
      group.add(u.root);
    }
  }

  return {
    group,
    load,
    cancel() {
      cancelled = true;
    },
    update(journey, dt) {
      for (const u of units) {
        const visible = journey >= u.window[0] && journey <= u.window[1];
        u.root.visible = visible;
        if (visible) u.update?.(journey, dt);
      }
    },
  };
}
