import {
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
} from "three";
import { ThemeBinder, mixRoles } from "./palette";
import { CameraRail, type RailKey } from "./rail";
import { toneToHex } from "@/lib/m3/theme";
import { buildRunwayTexture } from "./textures";
import { buildAtmosphere, type AtmosphereRig } from "./atmosphere";
import { buildEmblem, type EmblemRig } from "./objects/emblem";
import { buildThemeField, type FieldRig } from "./objects/field";
import { buildChamber, type ChamberRig } from "./objects/chamber";
import { buildDesktopStage, type StageRig } from "./objects/stage";
import { buildLaptop, type LaptopRig } from "./objects/laptop";
import { buildInterface, type InterfaceRig } from "./objects/interface";
import { buildWorkstation, type StationRig } from "./objects/station";
import type { M3Scheme } from "@/lib/m3/theme";

/**
 * The World — one persistent scene holding every sequence, laid out along a
 * single −Z journey axis so transitions are camera moves through shared
 * space, never fade-and-replace. All per-frame state is a pure function of
 * (journey, dt): bidirectional scrubbing is exact.
 */

/* Journey chapters — the single authoritative segmentation */
export const CHAPTERS = [
  { id: "ignition", title: "Ignition", start: 0.0, end: 0.1 },
  { id: "world", title: "Enter the world", start: 0.1, end: 0.22 },
  { id: "engine", title: "The theme engine", start: 0.22, end: 0.36 },
  { id: "chamber", title: "The instrument chamber", start: 0.36, end: 0.48 },
  { id: "desktop", title: "The desktop materializes", start: 0.48, end: 0.58 },
  { id: "film", title: "The product film", start: 0.58, end: 0.68 },
  { id: "hardware", title: "Hardware revelation", start: 0.68, end: 0.8 },
  { id: "system", title: "Enter the system", start: 0.8, end: 0.89 },
  { id: "reveal", title: "The reveal", start: 0.89, end: 1.0 },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]["id"];

const RAIL_KEYS: RailKey[] = [
  /* 00 IGNITION — close, dark, reverent */
  { at: 0.0, pos: [0.5, 0.7, 7.9], look: [0, 0.8, 0], fov: 41 },
  { at: 0.05, pos: [-1.2, 1.15, 6.4], look: [0, 0.8, 0], fov: 42 },
  /* 01 ENTER THE WORLD — pull back, rise, the world opens */
  { at: 0.1, pos: [-3.4, 2.4, 9.8], look: [0, 0.9, -3], fov: 48 },
  { at: 0.16, pos: [-0.6, 5.2, 17.5], look: [0, 1.4, -14], fov: 52, ease: "out" },
  { at: 0.22, pos: [0, 5.6, -56], look: [0, 2.4, -70], fov: 54, ease: "in" },
  /* 02 THEME ENGINE — descend into the tonal arcs */
  { at: 0.285, pos: [0, 3.4, -66.5], look: [0, 2.6, -70], fov: 52 },
  { at: 0.33, pos: [0, 2.4, -76], look: [0, 2.4, -78], fov: 50 },
  { at: 0.36, pos: [0, 2.3, -86], look: [0, 2.1, -96], fov: 50, ease: "out" },
  /* 03 INSTRUMENT CHAMBER — approach, settle inside the panel arc */
  { at: 0.42, pos: [0, 1.9, -122], look: [0, 1.6, -138], fov: 50 },
  { at: 0.475, pos: [0, 1.7, -134], look: [0, 1.7, -146], fov: 48 },
  { at: 0.48, pos: [0, 1.7, -134.6], look: [0, 1.7, -146], fov: 48, ease: "linear" },
  /* 04 DESKTOP MATERIALIZES — travel to the stage, then screen close-up */
  { at: 0.53, pos: [0, 2.6, -178], look: [0, 3, -206], fov: 50 },
  { at: 0.58, pos: [0, 3, -204.4], look: [0, 3.05, -214], fov: 46 },
  /* 05 PRODUCT FILM — hold close, intimate */
  { at: 0.68, pos: [0, 3.02, -207.2], look: [0, 3.05, -214], fov: 42 },
  /* 06 HARDWARE — approach, orbit during dissection */
  { at: 0.72, pos: [0, 1.3, -261], look: [0, 0.4, -280.5], fov: 50, ease: "out" },
  { at: 0.765, pos: [7.6, 2.4, -272], look: [0, 0.3, -280.5], fov: 48, ease: "linear" },
  { at: 0.8, pos: [-7.6, 3.2, -272], look: [0, 0.5, -280.5], fov: 48 },
  { at: 0.845, pos: [0, 2.7, -273.2], look: [0, 1.7, -280.5], fov: 46 },
  /* 07 ENTER THE SYSTEM — over the deck, through the glass, into the interface */
  { at: 0.89, pos: [0, 1.7, -283.6], look: [0, 1.1, -296], fov: 52, ease: "out" },
  { at: 0.92, pos: [0, 0.1, -316], look: [0, 0, -330], fov: 54 },
  { at: 0.945, pos: [0, 0, -333], look: [0, 0, -346], fov: 54, ease: "linear" },
  /* 08 THE REVEAL — arrive early, then hold the final composition */
  { at: 0.965, pos: [-1, 2.2, -404], look: [-1, 0.5, -430], fov: 52, ease: "out" },
  { at: 0.985, pos: [-0.7, 1.6, -413.8], look: [-1.2, 0.5, -430.5], fov: 48, ease: "out" },
  { at: 1.0, pos: [-0.65, 1.6, -414.5], look: [-1.2, 0.5, -430.5], fov: 48 },
];

interface ActiveRig {
  start: number;
  end: number;
  update(journey: number, dt: number): void;
}

/**
 * Exposure rail — a filmic light meter, pure f(journey). Ignition opens in
 * near-darkness, the world opening lifts, the chamber is controlled, the
 * hardware bench is punchy, the reveal settles bright.
 */
const EXPOSURE_KEYS: { at: number; v: number }[] = [
  { at: 0.0, v: 1.0 },
  { at: 0.05, v: 1.06 },
  { at: 0.16, v: 1.16 },
  { at: 0.28, v: 1.06 },
  { at: 0.4, v: 1.1 },
  { at: 0.52, v: 1.04 },
  { at: 0.62, v: 1.1 },
  { at: 0.76, v: 1.0 },
  { at: 0.9, v: 1.12 },
  { at: 1.0, v: 1.16 },
];

export function exposureAt(journey: number): number {
  for (let i = 0; i < EXPOSURE_KEYS.length - 1; i++) {
    const a = EXPOSURE_KEYS[i];
    const b = EXPOSURE_KEYS[i + 1];
    if (journey >= a.at && journey <= b.at) {
      const t = (journey - a.at) / (b.at - a.at);
      const eased = t * t * (3 - 2 * t);
      return a.v + (b.v - a.v) * eased;
    }
  }
  return 1.08;
}

export class World {
  readonly root = new Scene();
  readonly rail = new CameraRail(RAIL_KEYS);
  private rigs: ActiveRig[] = [];
  private sceneSchemes: ((s: M3Scheme) => void)[] = [];
  private atmosphere: AtmosphereRig;

  constructor(binder: ThemeBinder) {
    this.buildEnvironment(binder);
    this.buildSequences(binder);
    this.atmosphere = buildAtmosphere(binder);
    this.root.add(this.atmosphere.group);
  }

  private buildEnvironment(binder: ThemeBinder) {
    /* The lighting rig — broad key, restrained theme-tinted rim, soft fill.
       No shadow maps: contact shadows are authored planes. Hemisphere tones
       come straight from the neutral palette so dark mode stays dark. */
    const hemi = new HemisphereLight(0xcfd0dd, 0x14121a, 0.6);
    binder.color(hemi.color, (s) =>
      toneToHex(s.palettes.neutral, s.mode === "dark" ? 32 : 92)
    );
    binder.color(hemi.groundColor, (s) =>
      toneToHex(s.palettes.neutral, s.mode === "dark" ? 12 : 55)
    );
    this.root.add(hemi);

    const key = new DirectionalLight(0xffffff, 1.15);
    key.position.set(9, 15, 11);
    binder.color(key.color, (s) => s.roles.onSurface);
    this.root.add(key);

    const rim = new DirectionalLight(0xffffff, 0.85);
    rim.position.set(-7, 9, -13);
    binder.color(rim.color, (s) => s.roles.primary);
    this.root.add(rim);

    /* one continuous floor for the whole journey — deliberately matte:
       at grazing angles a reflective floor Fresnel-mirrors the environment
       and washes the whole opening shot gray */
    const floor = new Mesh(
      new PlaneGeometry(400, 760),
      binder.material(
        new MeshStandardMaterial({ metalness: 0.04, roughness: 0.96, envMapIntensity: 0.05 }),
        (s) => (s.mode === "dark" ? s.roles.surfaceDim : s.roles.surfaceContainerLow)
      )
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -0.02, -220);
    this.root.add(floor);

    /* the runway — a machined emissive inlay stitching all sequences into
       one navigable place (replaces the old laser-beam spine box) */
    const runwayTex = buildRunwayTexture();
    runwayTex.repeat.set(1, 95);
    const runwayMat = new MeshStandardMaterial({
      map: runwayTex,
      emissiveMap: runwayTex,
      transparent: true,
      opacity: 0.9,
      metalness: 0.1,
      roughness: 0.5,
      emissiveIntensity: 0.55,
      depthWrite: false,
    });
    binder.material(runwayMat, () => "#141218", (s) =>
      mixRoles("primary", "onSurface", 0.62)(s)
    );
    const runway = new Mesh(new PlaneGeometry(3.2, 760), runwayMat);
    runway.rotation.x = -Math.PI / 2;
    runway.position.set(0, 0.008, -220);
    runway.renderOrder = 1;
    this.root.add(runway);
  }

  private buildSequences(binder: ThemeBinder) {
    const place = (rig: { group: Group }, z: number) => {
      rig.group.position.z = z;
      this.root.add(rig.group);
    };
    const local = (j: number, c: { start: number; end: number }) =>
      Math.min(1, Math.max(0, (j - c.start) / (c.end - c.start)));

    /* 00–01 emblem */
    const emblem = buildEmblem(binder);
    place(emblem, 0);
    this.rigs.push({
      start: CHAPTERS[0].start - 0.02,
      end: CHAPTERS[1].end + 0.02,
      update: (j) => emblem.update(local(j, CHAPTERS[0]), local(j, CHAPTERS[1]), 0),
    });

    /* 02 field */
    const field = buildThemeField(binder);
    place(field, -70);
    field.update(0, 0);
    this.rigs.push({
      start: CHAPTERS[2].start - 0.02,
      end: CHAPTERS[2].end + 0.02,
      update: (j) => field.update(local(j, CHAPTERS[2]), 0),
    });
    this.sceneSchemes.push((s) => field.setScheme(s));

    /* 03 chamber */
    const chamber = buildChamber(binder);
    place(chamber, -140);
    chamber.update(0);
    this.rigs.push({
      start: CHAPTERS[3].start - 0.02,
      end: CHAPTERS[3].end + 0.02,
      update: (j) => chamber.update(local(j, CHAPTERS[3])),
    });

    /* 04–05 desktop stage */
    const stage = buildDesktopStage(binder);
    place(stage, -210);
    stage.update(0, 0);
    this.rigs.push({
      start: CHAPTERS[4].start - 0.02,
      end: CHAPTERS[5].end + 0.02,
      update: (j, dt) =>
        stage.update(local(j, CHAPTERS[4]), local(j, CHAPTERS[5])),
    });
    this.sceneSchemes.push(() => stage.setSchemeDirty());

    /* 06 laptop */
    const laptop = buildLaptop(binder);
    place(laptop, -280.5);
    this.rigs.push({
      start: CHAPTERS[6].start - 0.02,
      end: CHAPTERS[6].end + 0.02,
      update: (j, dt) => laptop.update(local(j, CHAPTERS[6]), dt),
    });
    this.sceneSchemes.push(() => laptop.setScheme());

    /* 07 interface */
    const iface = buildInterface(binder);
    place(iface, -330);
    this.rigs.push({
      start: CHAPTERS[7].start - 0.02,
      end: CHAPTERS[7].end + 0.02,
      update: (j) => iface.update(local(j, CHAPTERS[7])),
    });
    this.sceneSchemes.push(() => iface.setScheme());

    /* 08 workstation */
    const station = buildWorkstation(binder);
    place(station, -430);
    station.update(0);
    this.rigs.push({
      start: CHAPTERS[8].start - 0.02,
      end: 1.02,
      update: (j) => station.update(local(j, CHAPTERS[8])),
    });
    this.sceneSchemes.push(() => station.setScheme());
  }

  /** Called on every frame by the engine. */
  update(journey: number, dt: number): void {
    for (const rig of this.rigs) {
      if (journey >= rig.start && journey <= rig.end) rig.update(journey, dt);
    }
    /* atmosphere is ambient — always on */
    this.atmosphere.update(dt);
  }

  /** Governor hook: keep dust sizing correct across DPR stages. */
  setPixelRatio(dpr: number): void {
    this.atmosphere.setPixelRatio(dpr);
  }

  /** Push a new scheme into every scene-level consumer (textures, instances). */
  setScheme(s: M3Scheme): void {
    for (const fn of this.sceneSchemes) fn(s);
  }
}

export function chapterAt(journey: number): number {
  for (let i = CHAPTERS.length - 1; i >= 0; i--) {
    if (journey >= CHAPTERS[i].start) return i;
  }
  return 0;
}

export function localIn(journey: number, chapter: number): number {
  const c = CHAPTERS[chapter];
  return Math.min(1, Math.max(0, (journey - c.start) / (c.end - c.start)));
}
