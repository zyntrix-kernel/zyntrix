import {
  PerspectiveCamera,
  Scene as ThreeScene,
  UniformsUtils,
  Vector2,
  WebGLRenderer,
} from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

/**
 * Post pipeline — the film grade.
 *
 * RenderPass → UnrealBloomPass → OutputPass (ACES + sRGB) → GradePass.
 *
 * The GradePass is authored GLSL doing four jobs in one full-screen sweep
 * (one pass, one uniform block, ~1ms at 1440p):
 *   1. filmic vignette (asymmetric, stronger at the bottom — like a lens)
 *   2. animated film grain (hash noise, luminance-weighted so darks stay clean)
 *   3. very subtle chromatic aberration at the frame edges only
 *   4. a gentle contrast pivot around deep gray ("digital film curve")
 *
 * Everything is authored to be felt, not seen. Under reduced motion the grain
 * uTime freezes; the pipeline is otherwise identical.
 */

export interface PostPipeline {
  composer: EffectComposer;
  bloom: UnrealBloomPass;
  grade: ShaderPass;
  setPixelRatio(dpr: number): void;
  setSize(w: number, h: number): void;
  /** Mode-aware grade: light scenes barely bloom, dark scenes glow. */
  setMood(dark: boolean): void;
  update(timeSeconds: number, dt: number): void;
  dispose(): void;
}

const GradeShader = {
  uniforms: UniformsUtils.clone({
    tDiffuse: { value: null as unknown },
    uTime: { value: 0 },
    uVignette: { value: 0.42 },
    uGrain: { value: 0.05 },
    uAberration: { value: 0.0016 },
    uPivot: { value: 0.32 },
    uContrast: { value: 1.045 },
  }),
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uVignette;
    uniform float uGrain;
    uniform float uAberration;
    uniform float uPivot;
    uniform float uContrast;
    varying vec2 vUv;

    float hash(vec2 p) {
      p = fract(p * vec2(443.897, 441.423));
      p += dot(p, p.yx + 19.19);
      return fract((p.x + p.y) * p.x);
    }

    void main() {
      vec2 uv = vUv;
      vec2 centered = uv - 0.5;

      /* chromatic aberration — scales with r^2 so the center is untouched */
      float r2 = dot(centered, centered);
      vec2 caOffset = centered * r2 * uAberration * 2.0;
      vec3 col;
      col.r = texture2D(tDiffuse, uv + caOffset).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv - caOffset).b;

      /* gentle filmic contrast pivot (display space, after OutputPass) */
      col = (col - uPivot) * uContrast + uPivot;

      /* vignette — roundish, heavier toward the bottom of frame */
      vec2 v = centered * vec2(1.05, 1.22);
      float vig = 1.0 - uVignette * smoothstep(0.35, 1.05, dot(v, v));
      col *= vig;

      /* film grain — luminance-weighted, stronger in midtones */
      float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
      float weight = smoothstep(0.02, 0.35, lum) * (1.0 - smoothstep(0.75, 1.0, lum));
      float g = hash(uv * vec2(1287.0, 971.0) + fract(uTime) * 91.7) - 0.5;
      col += g * uGrain * weight;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

export function createPostPipeline(
  renderer: WebGLRenderer,
  scene: ThreeScene,
  camera: PerspectiveCamera
): PostPipeline {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  /* restrained bloom — emissive inlays, cores and pools earn the glow */
  const bloom = new UnrealBloomPass(
    new Vector2(1, 1),
    0.34, // strength
    0.62, // radius
    0.85 // threshold — only true emissives cross it; screens stay below
  );
  composer.addPass(bloom);

  /* ACES tone mapping + sRGB conversion happens here (reads renderer state) */
  composer.addPass(new OutputPass());

  const grade = new ShaderPass(GradeShader);
  grade.renderToScreen = true;
  composer.addPass(grade);

  /* mood targets — the same damping philosophy as ThemeBinder */
  const mood = {
    dark: true,
    strengthCur: 0.34,
    strengthDark: 0.34,
    strengthLight: 0.18,
    thresholdCur: 0.85,
    thresholdDark: 0.85,
    thresholdLight: 0.93,
  };

  return {
    composer,
    bloom,
    grade,
    setPixelRatio(dpr: number) {
      composer.setPixelRatio(dpr);
      composer.setSize(window.innerWidth, window.innerHeight);
    },
    setSize(w: number, h: number) {
      composer.setSize(w, h);
    },
    setMood(dark: boolean) {
      mood.dark = dark;
    },
    update(timeSeconds: number, dt: number) {
      grade.uniforms.uTime.value = timeSeconds;
      const sTarget = mood.dark ? mood.strengthDark : mood.strengthLight;
      const tTarget = mood.dark ? mood.thresholdDark : mood.thresholdLight;
      const k = 1 - Math.exp(-6 * dt);
      mood.strengthCur += (sTarget - mood.strengthCur) * k;
      mood.thresholdCur += (tTarget - mood.thresholdCur) * k;
      bloom.strength = mood.strengthCur;
      bloom.threshold = mood.thresholdCur;
    },
    dispose() {
      bloom.dispose();
      composer.dispose();
    },
  };
}
