import {
  BoxGeometry,
  Color,
  Group,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  OctahedronGeometry,
  PointLight,
} from "three";
import { ThemeBinder, emissiveRole, darkPolymer } from "../palette";
import { toneToHex, type M3Scheme } from "@/lib/m3/theme";

/**
 * SEQUENCE 02 — THE THEME ENGINE
 *
 * The seed becomes structure: four tonal ramps (primary, secondary, tertiary,
 * neutral) rise as machined slab columns arranged in arcs around a central
 * seed crystal. Every slab is colored by tone(t) from the REAL HCT palettes —
 * change the seed and the entire structure re-tints; switch modes and the
 * whole tonal landscape re-levels. Heights follow the tone ladder, so the
 * composition IS the data.
 */

const TONES = [95, 86, 76, 66, 56, 46, 36, 26] as const;
const RAMPS = ["primary", "secondary", "tertiary", "neutral"] as const;

const SLAB_W = 0.85;
const ARC_RADIUS = 7.2;

const toneHex = (s: M3Scheme, ramp: (typeof RAMPS)[number], t: number): string =>
  toneToHex(s.palettes[ramp], t);

export interface FieldRig {
  group: Group;
  update(local: number, dt: number): void;
  setScheme(s: M3Scheme): void;
  seedLight: PointLight;
}

export function buildThemeField(binder: ThemeBinder): FieldRig {
  const group = new Group();

  const slabGeo = new BoxGeometry(SLAB_W, 1, SLAB_W);

  const meshes: InstancedMesh[] = [];
  const dummy = new Object3D();
  const tmpColor = new Color();

  RAMPS.forEach((ramp, ringIdx) => {
    const count = TONES.length;
    const mesh = new InstancedMesh(
      slabGeo,
      new MeshStandardMaterial({ roughness: 0.42, metalness: 0.25, envMapIntensity: 0.7 }),
      count
    );
    const radius = ARC_RADIUS + ringIdx * 2.1;
    /* Two arms per ramp with the |angle| < 0.34 corridor kept open — the
       camera travels the central aisle and must never hit a slab. */
    for (let i = 0; i < count; i++) {
      const t = TONES[i];
      const side = i < count / 2 ? 1 : -1;
      const k = i % (count / 2);
      const a = side * (0.34 + k * 0.21 + ringIdx * 0.03);
      const height = 0.7 + (t / 100) * 7.5;
      dummy.position.set(Math.sin(a) * radius, height / 2, -Math.cos(a) * radius);
      dummy.rotation.set(0, a, 0);
      dummy.scale.set(1, height, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      tmpColor.set(toneHex(binder.current, ramp, t));
      mesh.setColorAt(i, tmpColor);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.frustumCulled = false;
    meshes.push(mesh);
    group.add(mesh);
  });

  /* ---- seed crystal ---- */
  const seedMat = emissiveRole(binder, (s) => s.roles.source, 2.4);
  const seed = new Mesh(new OctahedronGeometry(0.9, 0), seedMat);
  seed.position.set(0, 2.6, 0);
  group.add(seed);

  const seedLight = new PointLight(0xffffff, 6, 26, 1.6);
  seedLight.position.set(0, 3.2, 0);
  binder.color(seedLight.color, (s) => s.roles.source);
  group.add(seedLight);

  /* ---- plinths under each arc ---- */
  const plinthMat = darkPolymer(binder);
  const plinthGeo = new BoxGeometry(17.5, 0.5, 1.4);
  for (let i = 0; i < RAMPS.length; i++) {
    const p = new Mesh(plinthGeo, plinthMat);
    p.position.set(0, -0.25, -(ARC_RADIUS + i * 2.1));
    group.add(p);
  }

  return {
    group,
    seedLight,
    setScheme(s: M3Scheme) {
      meshes.forEach((mesh, ringIdx) => {
        const ramp = RAMPS[ringIdx];
        for (let i = 0; i < TONES.length; i++) {
          tmpColor.set(toneHex(s, ramp, TONES[i]));
          mesh.setColorAt(i, tmpColor);
        }
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      });
    },
    update(local) {
      // Slabs rise from the floor, staggered, deterministic in both directions.
      const rise = Math.min(1, local * 1.35);
      meshes.forEach((mesh, rampIdx) => {
        for (let i = 0; i < TONES.length; i++) {
          const t = TONES[i];
          const height = 0.7 + (t / 100) * 7.5;
          const stagger = Math.min(1, Math.max(0, rise * 1.5 - (i + rampIdx) * 0.09));
          const eased = stagger * stagger * (3 - 2 * stagger);
          const side = i < TONES.length / 2 ? 1 : -1;
          const k = i % (TONES.length / 2);
          const a = side * (0.34 + k * 0.21 + rampIdx * 0.03);
          const radius = ARC_RADIUS + rampIdx * 2.1;
          dummy.position.set(Math.sin(a) * radius, (height * eased) / 2 - 0.001, -Math.cos(a) * radius);
          dummy.rotation.set(0, a, 0);
          dummy.scale.set(1, Math.max(height * eased, 0.001), 1);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
      });
      seed.rotation.y = local * 1.2;
      seed.rotation.x = Math.sin(local * Math.PI) * 0.25;
      seedLight.intensity = 5 + Math.sin(local * Math.PI) * 3;
    },
  };
}
