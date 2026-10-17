import {
  BufferGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Shape,
  TorusGeometry,
  CylinderGeometry,
  BoxGeometry,
  Object3D,
  PointLight,
} from "three";
import { emissiveRole, machinedMetal, ThemeBinder, mixRoles } from "../palette";

/**
 * SEQUENCE 00–01 — IGNITION / ENTER THE WORLD
 *
 * The Zyntrix emblem: a machined disc, an engraved ring, and the extruded Z
 * mark in theme-tinted metal — introduced in near darkness by a single rim
 * light and a slow dolly. The reveal is authored by progress, never by time:
 * at p=0 the emblem sits as a barely-lit silhouette; as the visitor scrolls,
 * the key light warms up, the emissive core wakes, and the world floor grid
 * fades in around it.
 */

const TICK_COUNT = 24;

function zShape(): Shape {
  // Chunky machined Z, authored as a polygon (units ~1.6 tall)
  const s = new Shape();
  const w = 1.15; // half width
  const h = 1.55; // half height
  const bar = 0.42; // stroke thickness of the diagonals
  s.moveTo(-w, h);
  s.lineTo(w, h);
  s.lineTo(w, h - bar * 0.9);
  s.lineTo(-w * 0.28, -h + bar * 0.9);
  s.lineTo(w, -h + bar * 0.9);
  s.lineTo(w, -h);
  s.lineTo(-w, -h);
  s.lineTo(-w, -h + bar * 0.9);
  s.lineTo(w * 0.28, h - bar * 0.9);
  s.lineTo(-w, h - bar * 0.9);
  s.closePath();
  return s;
}

export interface EmblemRig {
  group: Group;
  update(local: number, enterLocal: number, dt: number): void;
}

export function buildEmblem(binder: ThemeBinder): EmblemRig {
  const group = new Group();

  /* base disc */
  const base = new Mesh(
    new CylinderGeometry(2.55, 2.75, 0.22, 96),
    machinedMetal(binder)
  );
  base.position.y = -0.12;
  group.add(base);

  /* engraved ring */
  const ring = new Mesh(new TorusGeometry(2.02, 0.085, 24, 128), machinedMetal(binder));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.05;
  group.add(ring);

  /* machining tick marks around the ring */
  const tickGeo = new BoxGeometry(0.05, 0.05, 0.16);
  const tickMat = machinedMetal(binder);
  const ticks = new Object3D();
  for (let i = 0; i < TICK_COUNT; i++) {
    const a = (i / TICK_COUNT) * Math.PI * 2;
    const t = new Mesh(tickGeo, tickMat);
    t.position.set(Math.cos(a) * 2.02, 0.05, Math.sin(a) * 2.02);
    t.rotation.y = -a;
    ticks.add(t);
  }
  group.add(ticks);

  /* the Z mark — theme-tinted brushed metal */
  const zGeo: BufferGeometry = new ExtrudeGeometry(zShape(), {
    depth: 0.34,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.045,
    bevelSegments: 3,
    curveSegments: 8,
  });
  zGeo.center();
  const zMat = binder.material(
    new MeshStandardMaterial({ metalness: 0.85, roughness: 0.28, envMapIntensity: 1.1 }),
    mixRoles("primary", "onPrimary", 0.18)
  );
  const z = new Mesh(zGeo, zMat);
  /* Stand ON the disc: geometry is centered, so lift by half height (+ disc top). */
  z.scale.setScalar(0.8);
  z.position.y = 0.1 + 1.55 * 0.8 + 0.02;
  group.add(z);

  /* emissive core halo under the Z */
  const core = new Mesh(
    new CylinderGeometry(0.9, 0.9, 0.05, 48),
    emissiveRole(binder, (s) => s.roles.primary, 1.2)
  );
  core.position.y = 0.03;
  group.add(core);

  /* the single controlled light source of the opening */
  const ember = new PointLight(0xffffff, 0, 14, 1.8);
  ember.position.set(1.8, 2.6, 2.2);
  binder.color(ember.color, (s) => s.roles.primary);
  group.add(ember);

  return {
    group,
    update(local, enterLocal) {
      // local: IGNITION progress 0..1 ; enterLocal: ENTER THE WORLD 0..1
      const wake = Math.min(1, local * 1.6);
      ember.intensity = 2.2 * wake + 2.4 * Math.max(0, enterLocal - 0.2);
      // subtle turntable: face the camera at rest, present the profile on exit
      z.rotation.y = (1 - wake) * -0.18 + local * 0.3 + enterLocal * 0.5;
      core.scale.setScalar(0.6 + 0.4 * wake);
      // the whole emblem rotates a touch as the world opens up
      group.rotation.y = enterLocal * 0.6;
    },
  };
}
