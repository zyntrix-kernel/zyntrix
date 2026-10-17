import {
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  BoxGeometry,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { ThemeBinder, emissiveRole, machinedMetal, mixRoles } from "../palette";
import { makeScreenGradientTexture } from "../textures";

/**
 * SEQUENCE 07 — ENTER THE SYSTEM
 *
 * The camera crosses the display boundary into a three-dimensional interface:
 * wallpaper, top panel, windows and dock as separate dimensional layers,
 * each with real thickness, spaced on the Z axis so hierarchy reads as depth.
 * As progress advances the layers separate and the camera travels through
 * them toward the wallpaper — the theme's structure made spatial.
 */

export interface InterfaceRig {
  group: Group;
  update(local: number): void;
  setScheme(): void;
}

export function buildInterface(binder: ThemeBinder): InterfaceRig {
  const group = new Group();

  const frameMat = machinedMetal(binder);

  /* wallpaper layer (emissive gradient from the real roles) */
  const wall = new Group();
  const { texture: wallTex, redraw: redrawWall } = makeScreenGradientTexture(binder.current, false);
  const wallMat = emissiveRole(binder, () => "#ffffff", 1.0);
  wallMat.map = wallTex;
  wallMat.emissiveMap = wallTex;
  wallMat.emissive.set("#ffffff");
  wallMat.needsUpdate = true;
  const wallPlane = new Mesh(new PlaneGeometry(15, 9.4), wallMat);
  wall.add(wallPlane);
  wall.position.set(0, 0, -7);
  group.add(wall);

  /* top panel layer */
  const panel = new Group();
  const panelBar = new Mesh(new BoxGeometry(15, 0.85, 0.3), binder.material(
    new MeshStandardMaterial({ metalness: 0.2, roughness: 0.35 }),
    mixRoles("surfaceContainer", "primaryContainer", 0.25)
  ));
  panel.add(panelBar);
  for (let i = 0; i < 3; i++) {
    const dot = new Mesh(
      new BoxGeometry(0.5, 0.22, 0.08),
      emissiveRole(binder, (s) => (i === 0 ? s.roles.primary : s.roles.outline), i === 0 ? 1.6 : 0.5)
    );
    dot.position.set(5.4 + i * 0.9, 0, 0.2);
    panel.add(dot);
  }
  panel.position.set(0, 3.6, -3.4);
  group.add(panel);

  /* window layers — three glass slabs with emissive headers */
  const windows: Group[] = [];
  const winDefs = [
    { x: -4.2, y: 0.9, z: -1.6, w: 5.4, h: 3.6, ry: 0.16 },
    { x: 3.9, y: 1.5, z: -2.6, w: 4.8, h: 3.1, ry: -0.2 },
    { x: 0.4, y: -1.7, z: -0.6, w: 4.2, h: 2.6, ry: 0.05 },
  ];
  for (const d of winDefs) {
    const w = new Group();
    const body = new Mesh(
      new RoundedBoxGeometry(d.w, d.h, 0.22, 3, 0.09),
      binder.material(
        new MeshStandardMaterial({ metalness: 0.25, roughness: 0.3, envMapIntensity: 0.9 }),
        mixRoles("surfaceContainerLow", "surfaceContainer", 0.4)
      )
    );
    w.add(body);
    const header = new Mesh(
      new BoxGeometry(d.w - 0.2, 0.4, 0.06),
      emissiveRole(binder, (s) => s.roles.primaryContainer, 0.85)
    );
    header.position.set(0, d.h / 2 - 0.3, 0.13);
    w.add(header);
    for (let i = 0; i < 3; i++) {
      const line = new Mesh(
        new BoxGeometry((d.w - 0.7) * (1 - i * 0.18), 0.09, 0.04),
        emissiveRole(binder, (s) => s.roles.outlineVariant, 0.5)
      );
      line.position.set(0, d.h / 2 - 0.95 - i * 0.38, 0.13);
      w.add(line);
    }
    w.position.set(d.x, d.y, d.z);
    w.rotation.y = d.ry;
    windows.push(w);
    group.add(w);
  }

  /* dock layer */
  const dock = new Group();
  const dockBar = new Mesh(new RoundedBoxGeometry(7.6, 0.9, 0.4, 3, 0.16), binder.material(
    new MeshStandardMaterial({ metalness: 0.3, roughness: 0.3, envMapIntensity: 1 }),
    mixRoles("surfaceContainerHigh", "surface", 0.3)
  ));
  dock.add(dockBar);
  for (let i = 0; i < 7; i++) {
    const icon = new Mesh(
      new RoundedBoxGeometry(0.52, 0.52, 0.1, 2, 0.08),
      emissiveRole(binder, (s) => (i % 2 ? s.roles.tertiaryContainer : s.roles.primaryContainer), 0.9)
    );
    icon.position.set(-3 + i * 1, 0, 0.26);
    dock.add(icon);
  }
  dock.position.set(0, -3.4, 0.4);
  group.add(dock);

  /* screen-boundary light the camera flies through */
  const gate = new PointLight(0xffffff, 0, 30, 1.4);
  gate.position.set(0, 0, 2);
  binder.color(gate.color, (s) => s.roles.primary);
  group.add(gate);

  /* frame edge the camera passes (the physical display boundary) */
  const edge = new Mesh(new BoxGeometry(16.4, 0.35, 0.35), frameMat);
  edge.position.set(0, 4.95, 2.2);
  group.add(edge);
  const edge2 = edge.clone();
  edge2.position.y = -4.95;
  group.add(edge2);
  const edge3 = new Mesh(new BoxGeometry(0.35, 10.2, 0.35), frameMat);
  edge3.position.set(-8.15, 0, 2.2);
  group.add(edge3);
  const edge4 = edge3.clone();
  edge4.position.x = 8.15;
  group.add(edge4);

  return {
    group,
    update(local) {
      /* layers separate as the camera approaches, then hold — pure function */
      const spread = Math.min(1, Math.max(0, (local - 0.12) / 0.5));
      const e = spread * spread * (3 - 2 * spread);
      wall.position.z = -7 - e * 3.2;
      panel.position.z = -3.4 - e * 2.2;
      windows.forEach((w, i) => {
        const def = winDefs[i];
        w.position.z = def.z - e * (1.2 + i * 0.9);
        w.rotation.y = def.ry * (1 + e * 0.8);
      });
      dock.position.z = 0.4 - e * 0.6;
      gate.intensity = Math.sin(Math.min(1, local * 1.15) * Math.PI) * 14;
    },
    setScheme() {
      redrawWall(binder.current);
    },
  };
}
