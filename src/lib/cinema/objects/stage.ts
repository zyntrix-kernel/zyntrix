import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  Sprite,
  SpriteMaterial,
  Vector3,
  AdditiveBlending,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { ThemeBinder, darkPolymer, emissiveRole, machinedMetal } from "../palette";
import { DesktopTexture, makeGlowTexture } from "../textures";

/**
 * SEQUENCE 04 + 05 — THE DESKTOP MATERIALIZES / THE PRODUCT FILM
 *
 * A physical display assembles in stages (panel drops in, stand rises, screen
 * wakes), then the scripted demonstration plays ON ITS SCREEN — a canvas
 * texture painted from the real scheme where the seed row sweeps, "Apply
 * seed" presses, and a terminal types the apply script. Every pixel of that
 * beat is a pure function of journey progress: scrubbing backward replays it
 * perfectly.
 */

export interface StageRig {
  group: Group;
  update(local: number, desktopBeat: number): void;
  setSchemeDirty(): void;
  screenWorldPos: Vector3;
}

export function buildDesktopStage(binder: ThemeBinder): StageRig {
  const group = new Group();

  const frameMat = machinedMetal(binder);
  const bodyMat = darkPolymer(binder);

  const desktop = new DesktopTexture(binder.current);

  /* ---- display slab ---- */
  const displayRoot = new Group();
  const panel = new Mesh(
    new RoundedBoxGeometry(9.6, 6.05, 0.34, 4, 0.12),
    bodyMat
  );
  displayRoot.add(panel);

  const bezel = new Mesh(new RoundedBoxGeometry(9.2, 5.65, 0.06, 3, 0.05), frameMat);
  bezel.position.z = 0.17;
  displayRoot.add(bezel);

  const screen = new Mesh(
    new PlaneGeometry(8.9, 5.4),
    emissiveRole(binder, () => "#ffffff", 0.8)
  );
  (screen.material as MeshStandardMaterial).map = desktop.texture;
  /* display = pure emissive; black diffuse keeps spill lights from pushing
     it over the bloom threshold */
  (screen.material as MeshStandardMaterial).color.set("#050507");
  (screen.material as MeshStandardMaterial).emissiveMap = desktop.texture;
  (screen.material as MeshStandardMaterial).emissive.set("#ffffff");
  (screen.material as MeshStandardMaterial).needsUpdate = true;
  screen.position.z = 0.21;
  displayRoot.add(screen);

  const logoDot = new Mesh(new CylinderGeometry(0.09, 0.09, 0.02, 24), frameMat);
  logoDot.rotation.x = Math.PI / 2;
  logoDot.position.set(0, -2.72, 0.19);
  displayRoot.add(logoDot);

  /* ---- stand ---- */
  const stand = new Group();
  const neck = new Mesh(new BoxGeometry(0.7, 2.4, 0.35), frameMat);
  neck.position.y = -1.2;
  stand.add(neck);
  const foot = new Mesh(new RoundedBoxGeometry(3.4, 0.22, 1.6, 3, 0.09), frameMat);
  foot.position.y = -2.45;
  stand.add(foot);
  displayRoot.add(stand);

  displayRoot.position.set(0, 3.05, -4);
  group.add(displayRoot);

  /* ---- screen light spill ---- */
  const spill = new Sprite(
    new SpriteMaterial({
      map: makeGlowTexture(),
      transparent: true,
      opacity: 0.55,
      blending: AdditiveBlending,
      depthWrite: false,
    })
  );
  spill.scale.set(14, 9, 1);
  spill.position.set(0, 3.05, -3.7);
  group.add(spill);

  const screenLight = new PointLight(0xffffff, 0, 24, 1.6);
  screenLight.position.set(0, 3.05, -2.4);
  group.add(screenLight);

  /* ---- assembly stage elements: two floor rails the parts travel along ---- */
  const railMat = frameMat;
  const railGeo = new BoxGeometry(0.1, 0.1, 14);
  const railL = new Mesh(railGeo, railMat);
  railL.position.set(-7.5, 0.05, -4);
  const railR = new Mesh(railGeo, railMat);
  railR.position.set(7.5, 0.05, -4);
  group.add(railL, railR);

  const screenWorldPos = new Vector3(0, 3.05, -3.7);

  const ease = (t: number) => t * t * (3 - 2 * t);

  return {
    group,
    screenWorldPos,
    setSchemeDirty() {
      desktop.setScheme(binder.current);
    },
    update(local, desktopBeat) {
      desktop.redraw(desktopBeat);

      /* Assembly choreography (Sequence 04 local progress):
         0.00–0.25 panel descends; 0.15–0.4 stand rises; 0.35–0.6 screen wakes;
         then holds. Reversed scrolling reverses every step. */
      const drop = ease(Math.min(1, Math.max(0, (local - 0.02) / 0.25)));
      const lift = ease(Math.min(1, Math.max(0, (local - 0.16) / 0.26)));
      const wake = ease(Math.min(1, Math.max(0, (local - 0.38) / 0.24)));

      displayRoot.position.y = 3.05 + (1 - drop) * 6.5;
      displayRoot.rotation.x = (1 - drop) * 0.18;
      stand.position.y = (1 - lift) * -3.2;

      const emissive = wake * 0.8;
      const sm = screen.material as MeshStandardMaterial;
      sm.emissiveIntensity = emissive;
      spill.material.opacity = 0.14 * wake;
      screenLight.intensity = wake * 9 + (desktopBeat > 0.3 ? 2 : 0);

      /* Sequence 05 — camera handled by the rail; here the screen beats */
      // subtle parallax of the whole assembly while the demo plays
      displayRoot.rotation.y = Math.sin(local * Math.PI) * 0.06;
    },
  };
}
