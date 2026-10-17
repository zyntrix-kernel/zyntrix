import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Points,
  SRGBColorSpace,
  ShaderMaterial,
  SpotLight,
  Object3D,
} from "three";
import { ThemeBinder, mixRoles } from "./palette";

/**
 * Atmosphere — the shared air of the world.
 *
 * 1. DUST MOTES — one static BufferGeometry of ~1200 points spanning the whole
 *    journey corridor. Every gram of motion lives in the VERTEX SHADER
 *    (sinusoidal drift seeded per particle); the CPU uploads nothing per
 *    frame except one uTime float. Additive, soft-edged, theme-tinted.
 *
 * 2. LIGHT POOLS — authored SpotLights at the six stations. No shadow maps.
 *    They carve ellipses of light out of the matte floor, which is what makes
 *    a dark scene read as a place instead of a void.
 */

export interface AtmosphereRig {
  group: Group;
  /** Per-frame: advance ambient time, copy damped theme color into uniforms. */
  update(dt: number): void;
  /** Keep dust size correct when the engine governor changes DPR. */
  setPixelRatio(dpr: number): void;
  dispose(): void;
}

const DUST_COUNT = 1200;
/* The journey corridor: emblem (z 0) → workstation (z −430) */
const CORRIDOR = { x: 19, yMin: 0.12, yMax: 8.2, zNear: 46, zFar: -486 };

const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uHeightScale;
  attribute vec3 aSeed;
  attribute float aSize;
  varying float vFade;

  void main() {
    vec3 p = position;
    /* ambient drift — pure function of (uTime, seed); no CPU work */
    p.x += sin(uTime * 0.10 + aSeed.x * 6.2831) * 1.35;
    p.y += sin(uTime * 0.062 + aSeed.y * 6.2831) * 0.62
         + sin(uTime * 0.021 + aSeed.z * 6.2831) * 0.85;
    p.z += cos(uTime * 0.048 + aSeed.z * 6.2831) * 0.9;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    /* perspective size attenuation with a generous clamp */
    gl_PointSize = aSize * uPixelRatio * (10.0 / max(2.0, -mv.z));

    /* fade near the camera plane and at extreme distance — no popping */
    float nearFade = smoothstep(1.2, 5.0, -mv.z);
    float farFade = 1.0 - smoothstep(90.0, 150.0, -mv.z);
    float heightFade = smoothstep(0.0, 0.9, p.y / max(uHeightScale, 0.001));
    vFade = nearFade * farFade * (0.35 + 0.65 * heightFade);
  }
`;

const dustFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float falloff = smoothstep(0.5, 0.04, d);
    float core = smoothstep(0.16, 0.0, d) * 0.55;
    float a = (falloff * 0.5 + core) * vFade * uOpacity;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

export function buildAtmosphere(binder: ThemeBinder): AtmosphereRig {
  const group = new Group();
  const disposables: { dispose(): void }[] = [];

  /* ---------------- dust motes ---------------- */
  const positions = new Float32Array(DUST_COUNT * 3);
  const seeds = new Float32Array(DUST_COUNT * 3);
  const sizes = new Float32Array(DUST_COUNT);
  for (let i = 0; i < DUST_COUNT; i++) {
    positions[i * 3] = (Math.random() * 2 - 1) * CORRIDOR.x;
    positions[i * 3 + 1] =
      CORRIDOR.yMin + Math.random() * (CORRIDOR.yMax - CORRIDOR.yMin);
    positions[i * 3 + 2] =
      CORRIDOR.zFar + Math.random() * (CORRIDOR.zNear - CORRIDOR.zFar);
    seeds[i * 3] = Math.random();
    seeds[i * 3 + 1] = Math.random();
    seeds[i * 3 + 2] = Math.random();
    /* mostly fine motes, a few larger close ones */
    const big = Math.random() < 0.06;
    sizes[i] = big ? 14 + Math.random() * 8 : 3.5 + Math.random() * 5;
  }

  const dustGeo = new BufferGeometry();
  dustGeo.setAttribute("position", new BufferAttribute(positions, 3));
  dustGeo.setAttribute("aSeed", new BufferAttribute(seeds, 3));
  dustGeo.setAttribute("aSize", new BufferAttribute(sizes, 1));

  const dustColor = new Color("#8b7fae");
  binder.color(dustColor, (s) =>
    mixRoles("primary", "tertiary", 0.35)(s)
  );

  const dustMat = new ShaderMaterial({
    vertexShader: dustVertex,
    fragmentShader: dustFragment,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 1.75) },
      uHeightScale: { value: CORRIDOR.yMax },
      uColor: { value: dustColor },
      uOpacity: { value: 0.5 },
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  const dust = new Points(dustGeo, dustMat);
  dust.frustumCulled = false; /* spans the whole corridor */
  dust.renderOrder = 5;
  group.add(dust);
  disposables.push(dustGeo, dustMat);

  /* ---------------- station light pools ---------------- */
  interface Pool {
    light: SpotLight;
    base: number;
  }
  const pools: Pool[] = [];
  const addPool = (
    z: number,
    y: number,
    height: number,
    intensity: number,
    resolve: Parameters<ThemeBinder["color"]>[1],
    spread = 9
  ) => {
    const light = new SpotLight(0xffffff, intensity, 34, spread * 0.062, 0.95, 1.7);
    light.position.set(0, height, z);
    binder.color(light.color, resolve);
    const target = new Object3D();
    target.position.set(0, y, z);
    group.add(target);
    light.target = target;
    group.add(light);
    pools.push({ light, base: intensity });
  };

  /* emblem pool — cool, intimate */
  addPool(0, 0, 7.5, 26, (s) => mixRoles("primary", "onSurface", 0.55)(s), 7);
  /* field approach — wide, faint */
  addPool(-70, 0, 9, 18, (s) => s.roles.primary, 12);
  /* chamber — neutral work light */
  addPool(-146, 0, 8, 22, (s) => s.roles.onSurface, 9);
  /* desktop stage — theatrical front pool */
  addPool(-213.5, 0, 9.5, 24, (s) => mixRoles("primary", "tertiary", 0.4)(s), 8);
  /* hardware bench — focused */
  addPool(-280.5, 0, 7.5, 26, (s) => s.roles.onSurface, 6.5);
  /* workstation payoff — warm */
  addPool(-430, 0, 9, 22, (s) => mixRoles("tertiary", "onSurface", 0.5)(s), 9);

  /* faint emissive pools painted on the floor under each spot — the spots
     light the geometry, these sell the pool on the pure-matte floor */
  const poolTex = makePoolTexture();
  disposables.push(poolTex);
  const poolTint = new Color("#8b7fae");
  binder.color(poolTint, (s) => mixRoles("primary", "onSurface", 0.6)(s));
  for (const z of [0, -70, -146, -213.5, -280.5, -430]) {
    const poolMat = new MeshBasicMaterial({
      map: poolTex,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      opacity: 0.5,
    });
    poolMat.color.copy(poolTint);
    binder.color(poolMat.color, (s) => mixRoles("primary", "onSurface", 0.6)(s));
    const pool = new Mesh(new PlaneGeometry(11, 11), poolMat);
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(0, 0.012, z);
    group.add(pool);
    disposables.push(pool.geometry, poolMat);
  }

  return {
    group,
    update(dt: number) {
      dustMat.uniforms.uTime.value += dt;
      dustMat.uniforms.uColor.value.copy(dustColor);
    },
    setPixelRatio(dpr: number) {
      dustMat.uniforms.uPixelRatio.value = dpr;
    },
    dispose() {
      for (const d of disposables) d.dispose();
    },
  };
}

/* --- procedural floor-pool texture ------------------------------------- */

function makePoolTexture(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);
  g.addColorStop(0, "rgba(255,255,255,0.34)");
  g.addColorStop(0.42, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}
