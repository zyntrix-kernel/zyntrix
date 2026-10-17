import {
  BoxGeometry,
  Curve,
  CylinderGeometry,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { ThemeBinder, darkPolymer, emissiveRole, machinedMetal, mixRoles } from "../palette";
import { makeScreenGradientTexture } from "../textures";

/**
 * SEQUENCE 06 — HARDWARE REVELATION
 *
 * A full procedural laptop dissects itself along authored trajectories:
 * display assembly, keyboard deck (60 instanced keycaps + trackpad), logic
 * board (PCB, CPU with emissive die, RAM ×2), dedicated GPU with a spinning
 * fan, thermal piping, battery, and port cluster. Explode → hold with a slow
 * orbit → reassemble → the screen wakes. Everything is real geometry with
 * dimensional thickness; the choreography is a pure function of progress.
 */

export interface LaptopRig {
  group: Group;
  update(local: number, dt: number): void;
  setScheme(): void;
}

interface Part {
  root: Group;
  /** rest position */
  rest: Vector3;
  /** explode direction × distance */
  dir: Vector3;
  /** extra rotation while exploded (radians) */
  spin: number;
}

export function buildLaptop(binder: ThemeBinder): LaptopRig {
  const group = new Group();
  const parts: Part[] = [];

  const metal = machinedMetal(binder);
  const polymer = darkPolymer(binder);

  const addPart = (root: Group, rest: Vector3, dir: Vector3, spin = 0) => {
    root.position.copy(rest);
    parts.push({ root, rest, dir, spin });
    group.add(root);
  };

  /* ---------- display assembly ---------- */
  const display = new Group();
  const lid = new Mesh(new RoundedBoxGeometry(8.4, 5.5, 0.3, 4, 0.1), metal);
  display.add(lid);
  const { texture: lidTex, redraw: redrawLid } = makeScreenGradientTexture(binder.current, true);
  const lidScreen = new Mesh(
    new PlaneGeometry(7.9, 5.0),
    emissiveRole(binder, () => "#ffffff", 0)
  );
  const lidMat = lidScreen.material as MeshStandardMaterial;
  lidMat.map = lidTex;
  lidMat.emissiveMap = lidTex;
  lidMat.emissive.set("#ffffff");
  lidMat.needsUpdate = true;
  lidScreen.position.z = 0.16;
  display.add(lidScreen);
  const hinge = new Mesh(new CylinderGeometry(0.16, 0.16, 8.2, 24), metal);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, -2.75, 0);
  display.add(hinge);
  addPart(display, new Vector3(0, 2.2, -0.5), new Vector3(0, 2.6, -3.4), -0.35);

  /* ---------- keyboard deck ---------- */
  const deck = new Group();
  const deckBody = new Mesh(new RoundedBoxGeometry(8.6, 0.34, 5.9, 4, 0.12), metal);
  deck.add(deckBody);

  const keyGeo = new RoundedBoxGeometry(0.42, 0.1, 0.42, 2, 0.04);
  const keyMat = binder.material(
    new MeshStandardMaterial({ metalness: 0.2, roughness: 0.55, envMapIntensity: 0.5 }),
    mixRoles("surfaceContainerHigh", "surfaceContainerHighest", 0.5)
  );
  const keys = new InstancedMesh(keyGeo, keyMat, 60);
  const dummy = new Object3D();
  let ki = 0;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 15; col++) {
      if (ki >= 60) break;
      dummy.position.set(-3.15 + col * 0.45, 0.24, -1.7 + row * 0.5);
      dummy.updateMatrix();
      keys.setMatrixAt(ki, dummy.matrix);
      ki++;
    }
  }
  keys.instanceMatrix.needsUpdate = true;
  deck.add(keys);

  const trackpad = new Mesh(new RoundedBoxGeometry(2.6, 0.05, 1.7, 2, 0.03), polymer);
  trackpad.position.set(0, 0.2, 1.85);
  deck.add(trackpad);
  addPart(deck, new Vector3(0, -0.17, 0.6), new Vector3(0, -2.4, 2.2), 0.12);

  /* ---------- logic board ---------- */
  const board = new Group();
  const pcb = new Mesh(new BoxGeometry(6.6, 0.08, 4.4), binder.material(
    new MeshStandardMaterial({ metalness: 0.3, roughness: 0.5 }),
    (s) => s.roles.surfaceContainerLow
  ));
  board.add(pcb);
  const cpu = new Mesh(new RoundedBoxGeometry(1.1, 0.14, 1.1, 2, 0.03), metal);
  cpu.position.set(-0.7, 0.12, -0.4);
  board.add(cpu);
  const die = new Mesh(new BoxGeometry(0.6, 0.05, 0.6), emissiveRole(binder, (s) => s.roles.primary, 2));
  die.position.set(-0.7, 0.21, -0.4);
  board.add(die);
  for (let i = 0; i < 2; i++) {
    const ram = new Mesh(new BoxGeometry(1.7, 0.18, 0.4), binder.material(
      new MeshStandardMaterial({ metalness: 0.4, roughness: 0.4 }),
      mixRoles("surfaceContainer", "onSurface", 0.15)
    ));
    ram.position.set(1.8, 0.14, -1.1 + i * 0.62);
    board.add(ram);
  }
  const chipset = new Mesh(new BoxGeometry(0.9, 0.1, 0.9), polymer);
  chipset.position.set(1.6, 0.1, 0.9);
  board.add(chipset);
  addPart(board, new Vector3(0, 0.05, 0.45), new Vector3(0, 1.4, 0.6), 0.2);

  /* ---------- GPU + fan ---------- */
  const gpu = new Group();
  const gpuBody = new Mesh(new RoundedBoxGeometry(2.7, 0.42, 1.9, 3, 0.08), polymer);
  gpu.add(gpuBody);
  const fan = new Group();
  const fanRing = new Mesh(new TorusGeometry(0.62, 0.06, 16, 48), metal);
  fan.add(fanRing);
  for (let b = 0; b < 7; b++) {
    const blade = new Mesh(new BoxGeometry(0.1, 0.02, 0.5), metal);
    blade.position.set(Math.cos((b / 7) * Math.PI * 2) * 0.3, 0, Math.sin((b / 7) * Math.PI * 2) * 0.3);
    blade.rotation.y = -(b / 7) * Math.PI * 2;
    blade.rotation.x = 0.5;
    fan.add(blade);
  }
  fan.position.set(0, 0.28, 0);
  gpu.add(fan);
  const gpuDie = new Mesh(new BoxGeometry(0.5, 0.04, 0.5), emissiveRole(binder, (s) => s.roles.tertiary, 1.6));
  gpuDie.position.set(0, 0.02, 0);
  gpu.add(gpuDie);
  addPart(gpu, new Vector3(-1.6, 0.32, 1.35), new Vector3(-3.2, 1.9, 1.8), 0.5);

  /* ---------- thermal piping ---------- */
  class PipeCurve extends Curve<Vector3> {
    constructor() {
      super();
    }
    getPoint(t: number, target = new Vector3()): Vector3 {
      const x = Math.sin(t * Math.PI) * 1.2;
      return target.set(-1.6 + t * 3.4 - x * 0.4, 0.1 + Math.sin(t * Math.PI) * 0.35, 1.35 + Math.cos(t * Math.PI * 0.5) * 0.3);
    }
  }
  const pipe = new Group();
  const tube = new Mesh(new TubeGeometry(new PipeCurve(), 48, 0.055, 12), metal);
  pipe.add(tube);
  addPart(pipe, new Vector3(0, 0.28, 1.35), new Vector3(0.4, 2.9, 1.1), 0);

  /* ---------- battery ---------- */
  const battery = new Group();
  const cell = new Mesh(new RoundedBoxGeometry(3.4, 0.3, 2.2, 3, 0.1), polymer);
  battery.add(cell);
  const led = new Mesh(new BoxGeometry(0.3, 0.06, 0.06), emissiveRole(binder, (s) => s.roles.success, 1.4));
  led.position.set(1.2, 0.18, 0.8);
  battery.add(led);
  addPart(battery, new Vector3(1.4, -0.02, 1.2), new Vector3(2.8, -2.2, 1.6), -0.25);

  /* ---------- port cluster ---------- */
  const ports = new Group();
  const portGeo = new BoxGeometry(0.09, 0.16, 0.5);
  const portMat = emissiveRole(binder, (s) => s.roles.outline, 0.3);
  for (let i = 0; i < 4; i++) {
    const p = new Mesh(portGeo, portMat);
    p.position.set(4.31, 0, -2 + i * 0.75);
    ports.add(p);
  }
  addPart(ports, new Vector3(0, 0, 0.4), new Vector3(3.6, 0.2, 1.4), 0);

  /* ---------- bottom shell ---------- */
  const shell = new Group();
  const under = new Mesh(new RoundedBoxGeometry(8.6, 0.3, 5.9, 4, 0.12), polymer);
  shell.add(under);
  addPart(shell, new Vector3(0, -0.42, 0.55), new Vector3(0, -3.4, -0.6), 0.08);

  /* ---------- contact shadow ---------- */
  const shadowMat = new MeshBasicMaterial({
    color: "#000000",
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
  const shadow = new Mesh(new PlaneGeometry(11, 8), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -2.2;
  group.add(shadow);

  const tmp = new Vector3();
  const ease = (t: number) => t * t * (3 - 2 * t);

  return {
    group,
    update(local, dt) {
      /* explode: 0→0.42 out, 0.42–0.6 hold, 0.6–0.85 reassemble, then wake */
      let explode: number;
      if (local < 0.42) explode = ease(local / 0.42);
      else if (local < 0.6) explode = 1;
      else if (local < 0.85) explode = 1 - ease((local - 0.6) / 0.25);
      else explode = 0;

      for (const p of parts) {
        tmp.copy(p.dir).multiplyScalar(explode);
        p.root.position.copy(p.rest).add(tmp);
        p.root.rotation.z = p.spin * explode;
        p.root.rotation.x = explode * 0.12;
      }

      // fan spins while disassembled (progress-scaled speed, dt-driven angle)
      fan.rotation.y += dt * (0.8 + explode * 9);

      // screen wakes after reassembly
      const wake = Math.max(0, (local - 0.86) / 0.14);
      lidMat.emissiveIntensity = ease(Math.min(1, wake)) * 1.3;
    },
    setScheme() {
      redrawLid(binder.current);
    },
  };
}
