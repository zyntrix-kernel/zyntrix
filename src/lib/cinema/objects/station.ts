import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  Texture,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { ThemeBinder, darkPolymer, emissiveRole, machinedMetal, mixRoles } from "../palette";
import { makeScreenGradientTexture, makeShadowTexture } from "../textures";

/**
 * SEQUENCE 08 — THE REVEAL
 *
 * The payoff composition: a complete workstation settles into frame — desk,
 * tower with a breathing power LED, display running the real desktop, input
 * devices, a restrained key light and two thin atmosphere shafts. The camera
 * arrives from the pullback and rests. This is the finished product.
 */

export interface StationRig {
  group: Group;
  update(local: number): void;
  setScheme(): void;
}

export function buildWorkstation(binder: ThemeBinder): StationRig {
  const group = new Group();

  const metal = machinedMetal(binder);
  const polymer = darkPolymer(binder);

  /* desk */
  const desk = new Mesh(new RoundedBoxGeometry(17, 0.35, 8.4, 4, 0.14), binder.material(
    new MeshStandardMaterial({ metalness: 0.1, roughness: 0.7, envMapIntensity: 0.4 }),
    mixRoles("surfaceContainerLow", "surfaceContainerHigh", 0.3)
  ));
  desk.position.y = -3.1;
  group.add(desk);

  /* tower */
  const tower = new Group();
  const caseBody = new Mesh(new RoundedBoxGeometry(2.5, 5.6, 4.6, 4, 0.18), metal);
  tower.add(caseBody);
  const front = new Mesh(new RoundedBoxGeometry(2.3, 5.4, 0.14, 3, 0.1), polymer);
  front.position.set(0, 0, 2.32);
  tower.add(front);
  const powerLed = new Mesh(new CylinderGeometry(0.07, 0.07, 0.05, 20), emissiveRole(binder, (s) => s.roles.primary, 2.2));
  powerLed.rotation.x = Math.PI / 2;
  powerLed.position.set(0.75, 2.1, 2.42);
  tower.add(powerLed);
  const ventGlow = new Mesh(new BoxGeometry(1.7, 0.12, 0.06), emissiveRole(binder, (s) => s.roles.primaryContainer, 0.8));
  ventGlow.position.set(0, -2.2, 2.42);
  tower.add(ventGlow);
  tower.position.set(4.6, -0.3, 0.6);
  tower.rotation.y = -0.42;
  group.add(tower);

  /* display + stand */
  const display = new Group();
  const panel = new Mesh(new RoundedBoxGeometry(8.6, 5.4, 0.3, 4, 0.12), polymer);
  display.add(panel);
  const { texture: screenTex, redraw: redrawScreen } = makeScreenGradientTexture(binder.current, true);
  const screenMat = emissiveRole(binder, () => "#ffffff", 1.25);
  screenMat.map = screenTex;
  screenMat.emissiveMap = screenTex;
  screenMat.emissive.set("#ffffff");
  screenMat.needsUpdate = true;
  const screen = new Mesh(new PlaneGeometry(8.1, 4.85), screenMat);
  screen.position.z = 0.17;
  display.add(screen);
  const neck = new Mesh(new BoxGeometry(0.6, 2.1, 0.3), metal);
  neck.position.y = -3.7;
  display.add(neck);
  const foot = new Mesh(new RoundedBoxGeometry(3, 0.2, 1.5, 3, 0.08), metal);
  foot.position.y = -4.8;
  display.add(foot);
  display.position.set(-2.4, 0.6, -0.6);
  display.rotation.y = 0.18;
  group.add(display);

  /* keyboard + mouse */
  const kb = new Group();
  const kbBody = new Mesh(new RoundedBoxGeometry(3.6, 0.16, 1.15, 3, 0.06), metal);
  kb.add(kbBody);
  const kbGlow = new Mesh(new BoxGeometry(3.3, 0.03, 0.8), emissiveRole(binder, (s) => s.roles.primaryContainer, 0.5));
  kbGlow.position.y = 0.1;
  kb.add(kbGlow);
  kb.position.set(-2.7, -2.75, 2.6);
  kb.rotation.y = 0.14;
  group.add(kb);

  const mouse = new Mesh(new RoundedBoxGeometry(0.55, 0.22, 0.9, 3, 0.12), polymer);
  mouse.position.set(-0.4, -2.7, 2.7);
  mouse.rotation.y = 0.14;
  group.add(mouse);

  /* contact shadows */
  const shadowTex = makeShadowTexture();
  const mkShadow = (w: number, h: number, x: number, z: number, opacity: number) => {
    const m = new Mesh(
      new PlaneGeometry(w, h),
      new MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity,
        depthWrite: false,
      })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, -2.9, z);
    group.add(m);
    return m;
  };
  mkShadow(9, 6, -2.4, -0.4, 0.5);
  mkShadow(4, 4.5, 4.6, 0.8, 0.55);

  /* atmosphere shafts — thin emissive planes, restrained */
  const shaftMat = emissiveRole(binder, (s) => s.roles.primary, 0.14);
  const shaft1 = new Mesh(new PlaneGeometry(0.35, 11), shaftMat);
  shaft1.position.set(-6.8, 2.5, -3.4);
  shaft1.rotation.z = 0.24;
  group.add(shaft1);
  const shaft2 = new Mesh(new PlaneGeometry(0.2, 9), shaftMat);
  shaft2.position.set(-5.9, 2.2, -3.2);
  shaft2.rotation.z = 0.24;
  group.add(shaft2);

  /* key light for the final shot — generous: this is the payoff frame */
  const key = new PointLight(0xffffff, 18, 34, 1.5);
  key.position.set(-4.5, 4.5, 4.5);
  binder.color(key.color, (s) => s.roles.primaryContainer);
  group.add(key);

  /* tower fill so the case reads against the dark */
  const fill = new PointLight(0xffffff, 6, 18, 1.8);
  fill.position.set(7, 1.5, 4);
  binder.color(fill.color, (s) => s.roles.surfaceContainerHighest);
  group.add(fill);

  const screenLight = new PointLight(0xffffff, 0, 20, 1.7);
  screenLight.position.set(-2.4, 0.9, 0.6);
  group.add(screenLight);

  const ease = (t: number) => t * t * (3 - 2 * t);

  return {
    group,
    update(local) {
      /* the scene settles: components ease into final composition */
      const settle = ease(Math.min(1, local * 1.25));
      display.position.y = 0.6 + (1 - settle) * 0.6;
      tower.position.y = -0.3 + (1 - settle) * 0.9;
      tower.rotation.y = -0.42 + (1 - settle) * 0.3;
      kb.position.y = -2.75 + (1 - settle) * 0.4;

      /* LEDs breathe; screen lights the desk */
      const breathe = 0.75 + Math.sin(local * Math.PI * 2) * 0.25;
      (powerLed.material as MeshStandardMaterial).emissiveIntensity = 2.2 * breathe;
      const wake = ease(Math.max(0, Math.min(1, (local - 0.15) / 0.4)));
      screenMat.emissiveIntensity = 1.25 * wake;
      screenLight.intensity = 10 * wake;
      key.intensity = 12 + settle * 8;
      fill.intensity = 4 + settle * 3;
    },
    setScheme() {
      redrawScreen(binder.current);
    },
  };
}
