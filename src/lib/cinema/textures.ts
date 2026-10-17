import {
  CanvasTexture,
  SRGBColorSpace,
  LinearFilter,
  RepeatWrapping,
} from "three";
import { toneToHex, type M3Scheme } from "@/lib/m3/theme";

/**
 * Procedural canvas textures for the film. All "screen content" in the 3D
 * world is drawn here from the REAL generated scheme — the same buildScheme()
 * output that drives the studio UI — so the desktop inside the film is the
 * product, not a decoration. Nothing is downloaded; everything is authored.
 */

export function makeGlowTexture(size = 128): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

/** Soft contact shadow blob (fake AO — deterministic, costs nothing). */
export function makeShadowTexture(size = 128): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(0,0,0,0.55)");
  g.addColorStop(0.55, "rgba(0,0,0,0.22)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new CanvasTexture(c);
  return tex;
}

/* ------------------------------------------------------------------ */
/*  The Plasma desktop — drawn from the live scheme                    */
/* ------------------------------------------------------------------ */

export interface DesktopBeat {
  /** 0..1 scripted Product Film progress (Sequence 05); 0 = idle desktop */
  beat: number;
}

const SWATCH_NAMES = ["Amethyst", "Moss", "Terracotta", "Rose", "Forest", "Plum"] as const;
const SWATCH_HEX = ["#67548a", "#386a20", "#8f4c38", "#984061", "#1f6d4d", "#7b519d"];

const TERMINAL_LINES = [
  "$ zyntrix apply --seed",
  "  ▸ building HCT scheme…",
  "  ▸ 43 roles · 4 tonal palettes",
  "  ▸ KDE colors · Konsole · icons",
  "✓ M3 scheme applied system-wide",
] as const;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Draws the whole Plasma desktop at 1024×640. `beat` drives the scripted
 * Sequence 05 beats as a PURE function (bidirectional, deterministic):
 *   0.00–0.18  idle desktop
 *   0.18–0.34  swatch cursor sweeps the seed row, lands on "Forest"
 *   0.34–0.42  apply press → brief accent pulse
 *   0.42–0.78  terminal types the apply script (substring by progress)
 *   0.78–0.92  success line + wallpaper tint shifts to the new seed
 *   0.92–1.00  hold
 */
export function drawDesktop(
  ctx: CanvasRenderingContext2D,
  scheme: M3Scheme,
  beat: number
): void {
  const W = 1024;
  const H = 640;
  const r = scheme.roles;
  const dark = scheme.mode === "dark";

  // Wallpaper — vertical tonal gradient of the real primary palette
  const wallTop = toneToHex(scheme.palettes.primary, dark ? 18 : 88);
  const wallBottom = toneToHex(scheme.palettes.neutral, dark ? 8 : 70);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, wallTop);
  bg.addColorStop(1, wallBottom);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Soft emblem glow upper right — barely-there halo (theme-aware)
  const glow = ctx.createRadialGradient(W * 0.8, H * 0.22, 10, W * 0.8, H * 0.22, 190);
  glow.addColorStop(0, r.primary + "33");
  glow.addColorStop(1, r.primary + "00");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const beatScript = (a: number, b: number) =>
    Math.min(1, Math.max(0, (beat - a) / (b - a)));

  /* ---------- top panel ---------- */
  ctx.fillStyle = dark ? r.surfaceContainer + "e6" : r.surfaceContainer + "f2";
  ctx.fillRect(0, 0, W, 34);
  ctx.fillStyle = r.primary;
  roundRect(ctx, 14, 8, 54, 18, 9);
  ctx.fill();
  ctx.fillStyle = r.onPrimary;
  ctx.font = "600 11px Roboto, sans-serif";
  ctx.fillText("Zyntrix", 24, 21);
  ctx.fillStyle = r.onSurfaceVariant;
  ctx.font = "11px Roboto, sans-serif";
  ctx.fillText("Dolphin", 84, 21);
  ctx.fillText("Konsole", 146, 21);
  ctx.textAlign = "right";
  ctx.fillStyle = r.onSurface;
  ctx.font = "600 11px Roboto, sans-serif";
  ctx.fillText("10:24", W - 16, 21);
  ctx.textAlign = "left";

  /* ---------- Dolphin window ---------- */
  const dw = { x: 60, y: 76, w: 380, h: 300 };
  ctx.fillStyle = r.surfaceContainerLow;
  roundRect(ctx, dw.x, dw.y, dw.w, dw.h, 14);
  ctx.fill();
  ctx.fillStyle = r.surfaceContainerHigh;
  roundRect(ctx, dw.x, dw.y, dw.w, 30, 14);
  ctx.fill();
  ctx.fillRect(dw.x, dw.y + 16, dw.w, 14);
  ctx.fillStyle = r.onSurface;
  ctx.font = "600 11px Roboto, sans-serif";
  ctx.fillText("Dolphin — Home", dw.x + 14, dw.y + 20);
  // sidebar
  const entries = ["Home", "Documents", "Pictures", "Downloads", "Trash"];
  entries.forEach((e, i) => {
    const active = i === 0;
    if (active) {
      ctx.fillStyle = r.secondaryContainer;
      roundRect(ctx, dw.x + 8, dw.y + 40 + i * 26, 96, 20, 8);
      ctx.fill();
      ctx.fillStyle = r.onSecondaryContainer;
    } else {
      ctx.fillStyle = r.onSurfaceVariant;
    }
    ctx.font = "10px Roboto, sans-serif";
    ctx.fillText(e, dw.x + 20, dw.y + 54 + i * 26);
  });
  // folder tiles
  const tiles = ["Design", "Music", "Walls", "Movies", "Notes", "Icons"];
  tiles.forEach((t, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const tx = dw.x + 120 + col * 84;
    const ty = dw.y + 44 + row * 92;
    ctx.fillStyle = i % 2 ? r.tertiaryContainer : r.primaryContainer;
    roundRect(ctx, tx, ty, 72, 68, 10);
    ctx.fill();
    ctx.fillStyle = i % 2 ? r.onTertiaryContainer : r.onPrimaryContainer;
    ctx.font = "600 9px Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(t, tx + 36, ty + 60);
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    roundRect(ctx, tx + 24, ty + 12, 24, 24, 4);
    ctx.fill();
  });

  /* ---------- Konsole window ---------- */
  const kw = { x: 470, y: 96, w: 470, h: 330 };
  ctx.fillStyle = r.surfaceContainerLowest;
  roundRect(ctx, kw.x, kw.y, kw.w, kw.h, 14);
  ctx.fill();
  ctx.fillStyle = r.surfaceContainerHigh;
  roundRect(ctx, kw.x, kw.y, kw.w, 30, 14);
  ctx.fill();
  ctx.fillRect(kw.x, kw.y + 16, kw.w, 14);
  ctx.fillStyle = r.onSurface;
  ctx.font = "600 11px Roboto, sans-serif";
  ctx.fillText("user@kubuntu: ~", kw.x + 14, kw.y + 20);
  ctx.font = "12px 'Roboto Mono', monospace";

  // The typed script: a pure function of beat. Idle keeps the command line
  // visible so the terminal never reads as dead glass.
  const typeT = beatScript(0.42, 0.78);
  const totalChars = TERMINAL_LINES.join("\n").length;
  let budget = Math.max(24, Math.round(typeT * totalChars));
  let ly = kw.y + 54;
  for (const line of TERMINAL_LINES) {
    if (budget <= 0) break;
    const take = Math.min(line.length, budget);
    const shown = line.slice(0, take);
    const isCmd = shown.startsWith("$");
    const isOk = shown.startsWith("✓");
    ctx.fillStyle = isCmd ? r.primary : isOk ? r.success ?? r.primary : r.onSurfaceVariant;
    ctx.fillText(shown, kw.x + 18, ly);
    budget -= take + 1; // +1 for the newline
    ly += 22;
  }
  // cursor blinks deterministically within the hold
  if (beat >= 0.78 && Math.floor(beat * 14) % 2 === 0) {
    ctx.fillStyle = r.primary;
    ctx.fillRect(kw.x + 18, ly - 11, 7, 14);
  }

  /* ---------- seed panel (right) — the real seed row ---------- */
  const pw = { x: 470, y: 450, w: 470, h: 130 };
  ctx.fillStyle = r.surfaceContainer;
  roundRect(ctx, pw.x, pw.y, pw.w, pw.h, 16);
  ctx.fill();
  ctx.fillStyle = r.onSurface;
  ctx.font = "600 12px Roboto, sans-serif";
  ctx.fillText("Seed", pw.x + 18, pw.y + 26);
  const sweep = beatScript(0.18, 0.34);
  const hoverIdx = Math.min(SWATCH_HEX.length - 1, Math.floor(sweep * SWATCH_HEX.length));
  SWATCH_HEX.forEach((hex, i) => {
    const sx = pw.x + 20 + i * 74;
    const sy = pw.y + 44;
    const selected = beat >= 0.34 && i === 4;
    const hovered = beat > 0.18 && beat < 0.34 && i === hoverIdx;
    if (selected || hovered) {
      ctx.fillStyle = selected ? r.primary : r.outlineVariant;
      roundRect(ctx, sx - 5, sy - 5, 62, 62, 16);
      ctx.fill();
    }
    ctx.fillStyle = hex;
    roundRect(ctx, sx, sy, 52, 52, 14);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "9px Roboto, sans-serif";
    ctx.fillText(SWATCH_NAMES[i].slice(0, 7), sx + 2, sy + 64);
  });
  // Apply button pressed at 0.34–0.42
  const press = beatScript(0.34, 0.42);
  ctx.fillStyle = press > 0 && press < 1 ? r.primary : r.primaryContainer;
  roundRect(ctx, pw.x + 20, pw.y + 100, 96, 22, 11);
  ctx.fill();
  ctx.fillStyle = press > 0 && press < 1 ? r.onPrimary : r.onPrimaryContainer;
  ctx.font = "600 10px Roboto, sans-serif";
  ctx.fillText("Apply seed", pw.x + 34, pw.y + 115);

  /* ---------- Material clock widget ---------- */
  ctx.fillStyle = r.inverseSurface;
  roundRect(ctx, 60, 470, 210, 110, 18);
  ctx.fill();
  ctx.fillStyle = r.inverseOnSurface;
  ctx.font = "300 40px Roboto, sans-serif";
  ctx.fillText("10:24", 80, 530);
  ctx.font = "10px Roboto, sans-serif";
  ctx.fillText("Mon, May 12", 80, 552);

  // Wallpaper tint shift at the end of the beat — hue follows the picked seed
  const tint = beatScript(0.78, 0.92);
  if (tint > 0) {
    ctx.globalAlpha = 0.16 * tint;
    ctx.fillStyle = "#1f6d4d";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  // Vignette for screen depth
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.5, W / 2, H / 2, H * 0.95);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

/** A live, redrawable desktop screen texture. */
export class DesktopTexture {
  readonly texture: CanvasTexture;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private scheme: M3Scheme;
  private lastBeat = -1;
  private lastKey = "";

  constructor(scheme: M3Scheme) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 1024;
    this.canvas.height = 640;
    this.ctx = this.canvas.getContext("2d")!;
    this.scheme = scheme;
    this.texture = new CanvasTexture(this.canvas);
    this.texture.colorSpace = SRGBColorSpace;
    this.texture.minFilter = LinearFilter;
    this.texture.anisotropy = 4;
    this.redraw(0);
  }

  setScheme(scheme: M3Scheme): void {
    this.scheme = scheme;
    this.redraw(this.lastBeat);
  }

  /** Redraws only when the beat bucket or theme actually changed. */
  redraw(beat: number): void {
    const bucket = Math.round(beat * 160);
    const key = `${bucket}|${this.scheme.source}|${this.scheme.mode}`;
    if (key === this.lastKey) return;
    this.lastKey = key;
    this.lastBeat = beat;
    drawDesktop(this.ctx, this.scheme, bucket / 160);
    this.texture.needsUpdate = true;
  }

  dispose(): void {
    this.texture.dispose();
  }
}

/** Simple emissive gradient screen (laptop display, reveal monitor). */
export function makeScreenGradientTexture(
  scheme: M3Scheme,
  withDesktop = true
): { canvas: HTMLCanvasElement; texture: CanvasTexture; redraw: (s: M3Scheme) => void } {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext("2d")!;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  const redraw = (s: M3Scheme) => {
    if (withDesktop) {
      drawDesktop(ctx, s, 0);
    } else {
      const g = ctx.createLinearGradient(0, 0, 1024, 640);
      g.addColorStop(0, s.roles.primaryContainer);
      g.addColorStop(0.55, s.roles.surfaceContainerLow);
      g.addColorStop(1, s.roles.tertiaryContainer);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 1024, 640);
    }
    texture.needsUpdate = true;
  };
  redraw(scheme);
  return { canvas, texture, redraw };
}

/* ------------------------------------------------------------------ */
/*  The runway — machined guide inlay running the whole corridor       */
/* ------------------------------------------------------------------ */

/**
 * Draws one repeatable segment of the runway inlay: a center guide line,
 * twin edge rails, direction chevrons and cross ticks. Tiled along −Z by a
 * plane 3.2 wide × 760 long. Used as BOTH map and emissiveMap so the inlay
 * is a real (subtle) light source — the bloom pass gives it life without
 * the old "laser beam through every shot" artifact.
 */
export function buildRunwayTexture(): CanvasTexture {
  const W = 512;
  const H = 1024; /* one tile = 8 world units of length (plane scale) */
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  ctx.clearRect(0, 0, W, H);

  const line = (x: number, w: number, alpha: number) => {
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(x - w / 2, 0, w, H);
  };

  /* center guide + edge rails */
  line(W * 0.5, 3, 0.85);
  line(W * 0.12, 2, 0.4);
  line(W * 0.88, 2, 0.4);

  /* dashed outer rails */
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  for (let y = 0; y < H; y += 64) {
    ctx.fillRect(W * 0.045 - 1, y, 2, 34);
    ctx.fillRect(W * 0.955 - 1, y, 2, 34);
  }

  /* direction chevrons pointing down the journey (−Z = canvas up) */
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  for (let y = H - 90; y > 0; y -= 256) {
    ctx.beginPath();
    ctx.moveTo(W * 0.42, y + 26);
    ctx.lineTo(W * 0.5, y);
    ctx.lineTo(W * 0.58, y + 26);
    ctx.stroke();
  }

  /* measurement ticks + faint node dots */
  for (let y = 0; y < H; y += 128) {
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillRect(W * 0.5 - 7, y, 14, 2);
    ctx.beginPath();
    ctx.arc(W * 0.12, y + 64, 2.2, 0, Math.PI * 2);
    ctx.arc(W * 0.88, y + 64, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  /* faint machining noise so the strip never reads as vector-clean */
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  for (let i = 0; i < 240; i++) {
    ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
  }

  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}
