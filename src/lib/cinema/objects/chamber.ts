import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PointLight,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { ThemeBinder, darkPolymer, emissiveRole, machinedMetal, mixRoles } from "../palette";

/**
 * SEQUENCE 03 — THE INSTRUMENT CHAMBER
 *
 * A composed control environment: six precision panels arc around the flight
 * path, each a layered physical instrument (frame, glass, emissive readouts)
 * with correct occlusion and scale. The panels' emissive gauges tint from the
 * live scheme. The REAL controls for this chapter are the HTML HUD bound to
 * the page's actual theme state — the 3D is scenery with intent, the controls
 * are product.
 */

export interface ChamberRig {
  group: Group;
  update(local: number): void;
}

interface PanelRig {
  root: Group;
  baseY: number;
  phase: number;
}

export function buildChamber(binder: ThemeBinder): ChamberRig {
  const group = new Group();

  const frameMat = machinedMetal(binder);
  const bodyMat = darkPolymer(binder);
  const glassMat = binder.material(
    new MeshStandardMaterial({
      color: "#101014",
      metalness: 0.4,
      roughness: 0.18,
      envMapIntensity: 1.2,
    }),
    mixRoles("surfaceContainerLowest", "surfaceContainer", 0.4)
  );
  const gaugeMat = emissiveRole(binder, (s) => s.roles.primary, 1.5);
  const gaugeAltMat = emissiveRole(binder, (s) => s.roles.tertiary, 1.2);
  const tickMat = emissiveRole(binder, (s) => s.roles.outline, 0.55);

  const panels: PanelRig[] = [];

  const panelDefs = [
    { x: -5.6, y: 1.4, z: -8.5, ry: 0.55, w: 2.6, h: 1.7, variant: 0 },
    { x: -3.4, y: -0.6, z: -6.2, ry: 0.38, w: 2.0, h: 1.35, variant: 1 },
    { x: 5.2, y: 1.9, z: -9.2, ry: -0.52, w: 2.8, h: 1.8, variant: 2 },
    { x: 3.1, y: -1.1, z: -5.6, ry: -0.34, w: 2.1, h: 1.4, variant: 1 },
    { x: -0.4, y: 3.1, z: -10.8, ry: 0.06, w: 3.1, h: 1.9, variant: 0 },
    { x: 0.6, y: -2.3, z: -7.4, ry: -0.1, w: 1.8, h: 1.15, variant: 2 },
  ];

  for (const def of panelDefs) {
    const root = new Group();
    root.position.set(def.x, def.y, def.z);
    root.rotation.y = def.ry;

    // frame
    const frame = new Mesh(
      new RoundedBoxGeometry(def.w + 0.16, def.h + 0.16, 0.14, 3, 0.05),
      frameMat
    );
    root.add(frame);

    // glass face
    const glass = new Mesh(new RoundedBoxGeometry(def.w, def.h, 0.1, 3, 0.04), glassMat);
    glass.position.z = 0.05;
    root.add(glass);

    // emissive readouts per variant
    if (def.variant === 0) {
      // horizontal tone bars
      for (let i = 0; i < 7; i++) {
        const bar = new Mesh(new BoxGeometry(def.w * 0.72, 0.07, 0.03), i % 2 ? gaugeMat : gaugeAltMat);
        bar.position.set(-def.w * 0.05, def.h * 0.3 - i * (def.h * 0.11), 0.12);
        bar.scale.x = 0.35 + 0.65 * (1 - i / 7);
        root.add(bar);
      }
    } else if (def.variant === 1) {
      // dial + ticks
      const dial = new Mesh(new BoxGeometry(0.5, 0.5, 0.05), gaugeMat);
      dial.position.set(-def.w * 0.22, 0, 0.12);
      root.add(dial);
      for (let i = 0; i < 5; i++) {
        const tick = new Mesh(new BoxGeometry(0.34, 0.035, 0.03), tickMat);
        tick.position.set(def.w * 0.16, def.h * 0.26 - i * (def.h * 0.16), 0.12);
        root.add(tick);
      }
    } else {
      // role swatch grid 3×2
      for (let i = 0; i < 6; i++) {
        const sw = new Mesh(
          new BoxGeometry(def.w * 0.2, def.h * 0.3, 0.04),
          i % 2 ? gaugeAltMat : gaugeMat
        );
        sw.position.set(
          -def.w * 0.26 + (i % 3) * (def.w * 0.26),
          def.h * 0.18 - Math.floor(i / 3) * (def.h * 0.4),
          0.12
        );
        root.add(sw);
      }
    }

    // stand-off pylon to a floor rail (grounded, not floating randomly)
    const pylon = new Mesh(new BoxGeometry(0.07, Math.abs(def.y) + 2.6, 0.07), bodyMat);
    pylon.position.set(0, -(Math.abs(def.y) + 2.6) / 2 - def.h / 2 - 0.06, -0.02);
    root.add(pylon);

    panels.push({ root, baseY: def.y, phase: def.x * 0.9 + def.z });
    group.add(root);
  }

  /* chamber floor ring + accent light */
  const floorRing = new Mesh(new BoxGeometry(18, 0.12, 0.5), frameMat);
  floorRing.position.set(0, -3.4, -8);
  group.add(floorRing);

  const accent = new PointLight(0xffffff, 4, 20, 1.7);
  accent.position.set(0, 1.2, -7.5);
  binder.color(accent.color, (s) => s.roles.primary);
  group.add(accent);

  return {
    group,
    update(local) {
      // Panels breathe on approach and settle — position is a pure function.
      const active = Math.min(1, Math.max(0, (local - 0.1) / 0.5));
      for (const p of panels) {
        p.root.position.y = p.baseY + Math.sin(local * Math.PI) * 0.22;
        p.root.scale.setScalar(0.6 + 0.4 * active);
        p.root.rotation.z = Math.sin(p.phase + local * Math.PI * 2) * 0.012;
      }
      accent.intensity = 2.5 + Math.sin(local * Math.PI) * 2.5;
    },
  };
}
