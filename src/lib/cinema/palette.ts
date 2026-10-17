import { Color, Fog, MeshStandardMaterial } from "three";
import { buildScheme, toneToHex, type M3Mode, type M3Scheme } from "@/lib/m3/theme";

/**
 * ThemeBinder — the only path from the M3/HCT theme engine into the film.
 *
 * Nothing in the world may hardcode a theme color. Materials and any other
 * color-bearing objects register here with a resolver that derives their
 * target color from the real generated scheme. On every theme change the
 * binder recomputes targets; the engine then damps every owned color toward
 * its target each frame (frame-rate independent), so a seed change reads as
 * one coherent re-tint of the world rather than a snap.
 */

interface Binding {
  owner: Color;
  target: Color;
  resolve: (scheme: M3Scheme) => string;
}

export type SchemeRole = keyof M3Scheme["roles"];

/** Convenience resolvers */
export const role =
  (name: SchemeRole) =>
  (s: M3Scheme): string =>
    s.roles[name];

/** tone(t) of a named tonal palette — straight from the real HCT palettes */
export const tone =
  (palette: keyof M3Scheme["palettes"], t: number) =>
  (s: M3Scheme): string =>
    toneToHex(s.palettes[palette], t);

/** mix two scheme colors in sRGB space (cheap artistic blend, engine values only) */
export const mixRoles =
  (a: SchemeRole, b: SchemeRole, amount: number) =>
  (s: M3Scheme): string => {
    const ca = new Color(s.roles[a]);
    const cb = new Color(s.roles[b]);
    return `#${ca.lerp(cb, amount).getHexString()}`;
  };

const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

export class ThemeBinder {
  private bindings: Binding[] = [];
  private scheme: M3Scheme;

  /** atmosphere targets, damped like everything else */
  readonly backgroundColor = new Color("#0b0910");
  readonly fogColor = new Color("#0b0910");
  readonly fog = new Fog(this.fogColor, 30, 190);
  private bgTarget = new Color("#0b0910");

  constructor(source: string, mode: M3Mode) {
    this.scheme = buildScheme(source, mode);
    this.recompute();
    this.snap();
  }

  /** Register a material's color (+ optional emissive) with resolvers.
   *  Materials are born SETTLED — the constructor color is the resolved
   *  scheme value, so there is never a white→theme flash on load. */
  material(
    mat: MeshStandardMaterial,
    color?: (s: M3Scheme) => string,
    emissive?: (s: M3Scheme) => string
  ): MeshStandardMaterial {
    if (color) {
      const target = new Color(color(this.scheme));
      mat.color.copy(target);
      this.bindings.push({ owner: mat.color, target, resolve: color });
    }
    if (emissive) {
      const target = new Color(emissive(this.scheme));
      mat.emissive.copy(target);
      this.bindings.push({
        owner: mat.emissive,
        target,
        resolve: emissive,
      });
    }
    return mat;
  }

  /** Register any color-bearing object (lights, sprite materials…). */
  color(owner: Color, resolve: (s: M3Scheme) => string): void {
    const target = new Color(resolve(this.scheme));
    owner.copy(target);
    this.bindings.push({ owner, target, resolve });
  }

  setTheme(source: string, mode: M3Mode): void {
    this.scheme = buildScheme(source, mode);
    this.recompute();
  }

  get current(): M3Scheme {
    return this.scheme;
  }

  private recompute(): void {
    for (const b of this.bindings) b.target.set(b.resolve(this.scheme));
    const dark = this.scheme.mode === "dark";
    // Atmosphere: deep, hue-tinted dark / airy light. Derived from real roles.
    const base = new Color(this.scheme.roles[dark ? "surfaceDim" : "surfaceBright"]);
    const deep = base.clone().multiplyScalar(dark ? 0.42 : 0.86);
    this.bgTarget.copy(deep);
    this.fog.near = dark ? 26 : 40;
    this.fog.far = dark ? 170 : 230;
  }

  /** Jump every owner straight to its target (used at construction). */
  private snap(): void {
    for (const b of this.bindings) b.owner.copy(b.target);
    this.backgroundColor.copy(this.bgTarget);
    this.fogColor.copy(this.bgTarget);
  }

  /** Per-frame damping toward targets. dt in seconds. */
  update(dt: number): void {
    const k = 7.5; // settles ≈ 400ms
    for (const b of this.bindings) {
      b.owner.setRGB(
        damp(b.owner.r, b.target.r, k, dt),
        damp(b.owner.g, b.target.g, k, dt),
        damp(b.owner.b, b.target.b, k, dt)
      );
    }
    this.backgroundColor.setRGB(
      damp(this.backgroundColor.r, this.bgTarget.r, k, dt),
      damp(this.backgroundColor.g, this.bgTarget.g, k, dt),
      damp(this.backgroundColor.b, this.bgTarget.b, k, dt)
    );
    this.fogColor.copy(this.backgroundColor);
  }
}

/** Standard metal / polymer / glass material factory (shared vocabulary). */
export function machinedMetal(binder: ThemeBinder): MeshStandardMaterial {
  return binder.material(
    new MeshStandardMaterial({
      color: "#3a3a42",
      metalness: 0.9,
      roughness: 0.32,
      envMapIntensity: 0.9,
    }),
    mixRoles("surfaceContainerLow", "outline", 0.45)
  );
}

export function darkPolymer(binder: ThemeBinder): MeshStandardMaterial {
  return binder.material(
    new MeshStandardMaterial({
      color: "#17161c",
      metalness: 0.15,
      roughness: 0.62,
      envMapIntensity: 0.5,
    }),
    mixRoles("surfaceContainerLow", "surfaceContainerHighest", 0.12)
  );
}

export function emissiveRole(
  binder: ThemeBinder,
  resolve: (s: M3Scheme) => string,
  intensity = 1.6
): MeshStandardMaterial {
  return binder.material(
    new MeshStandardMaterial({
      color: "#050507",
      emissive: resolve(binder.current),
      emissiveIntensity: intensity,
      metalness: 0,
      roughness: 0.4,
    }),
    () => "#050507",
    resolve
  );
}
