import {
  argbFromHex,
  hexFromArgb,
  Hct,
  SchemeTonalSpot,
  TonalPalette,
} from "@material/material-color-utilities";

export type M3Mode = "light" | "dark";

export const DEFAULT_SOURCE = "#67548a";

/** tone(t) of a tonal palette → proper #rrggbb (tone() is ARGB!).
 *
 *  Cached: a TonalPalette is fully determined by its (hue, chroma) pair, so
 *  that pair is a stable identity across re-created palettes of the same
 *  seed. Swatch grids resolve dozens of tones per render — the cache turns
 *  HCT re-solves into Map lookups. */
const TONE_CACHE_LIMIT = 2048;
const toneCache = new Map<string, string>();

export function toneToHex(p: TonalPalette, t: number): string {
  const key = `${p.hue.toFixed(2)}:${p.chroma.toFixed(2)}:${t}`;
  const hit = toneCache.get(key);
  if (hit !== undefined) return hit;
  const hex = hexFromArgb(p.tone(t));
  if (toneCache.size >= TONE_CACHE_LIMIT) toneCache.clear();
  toneCache.set(key, hex);
  return hex;
}

/** Wallpaper assets shipped with the theme (client-safe constants) */
export const WALLPAPER_FILES = [
  "m3-wallpaper-light.png",
  "m3-wallpaper-dark.png",
  "m3-wallpaper-bloom.png",
];

/** M3 baseline tones used for the tonal-palette showcase */
export const SHOWCASE_TONES = [100, 95, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];

/** Curated Material You seed colors (Google baseline hues) */
export const SEED_PRESETS: { name: string; hex: string }[] = [
  { name: "Amethyst", hex: "#67548a" },
  { name: "Moss", hex: "#386a20" },
  { name: "Terracotta", hex: "#8f4c38" },
  { name: "Rose", hex: "#984061" },
  { name: "Olive", hex: "#6c613c" },
  { name: "Cocoa", hex: "#77584b" },
  { name: "Forest", hex: "#1f6d4d" },
  { name: "Plum", hex: "#7b519d" },
];

export function normalizeHex(input: string): string {
  let h = (input || "").trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return DEFAULT_SOURCE;
  return "#" + h.toLowerCase();
}

export interface M3Scheme {
  source: string;
  mode: M3Mode;
  roles: Record<string, string>;
  palettes: {
    primary: TonalPalette;
    secondary: TonalPalette;
    tertiary: TonalPalette;
    error: TonalPalette;
    neutral: TonalPalette;
    neutralVariant: TonalPalette;
    success: TonalPalette;
    warning: TonalPalette;
    cyan: TonalPalette;
  };
}

/**
 * Builds a full Material 3 role set from a single source color, following the
 * M3 baseline tonal mappings (surface containers, outlines, inverse roles...).
 *
 * Cached LRU by (mode, seed): preset switching re-uses the same seeds over and
 * over and HCT scheme construction is pure, so identical inputs must never
 * recompute on the main thread.
 */
const SCHEME_CACHE_LIMIT = 48;
const schemeCache = new Map<string, M3Scheme>();

export function buildScheme(sourceHex: string, mode: M3Mode): M3Scheme {
  const source = normalizeHex(sourceHex);
  const cacheKey = `${mode}:${source}`;
  const cached = schemeCache.get(cacheKey);
  if (cached) {
    // Refresh recency for the LRU.
    schemeCache.delete(cacheKey);
    schemeCache.set(cacheKey, cached);
    return cached;
  }

  const dark = mode === "dark";
  const scheme = new SchemeTonalSpot(Hct.fromInt(argbFromHex(source.slice(1))), dark, 0.0);
  const role = (name: string) => hexFromArgb(scheme[name as keyof SchemeTonalSpot] as number);

  // M3 fixed error palette + auxiliary palettes for terminal/utility colors
  const error = TonalPalette.fromHueAndChroma(25, 84);
  const success = TonalPalette.fromHueAndChroma(145, 32);
  const warning = TonalPalette.fromHueAndChroma(70, 48);
  const cyan = TonalPalette.fromHueAndChroma(195, 28);

  const roles: Record<string, string> = {
    source,
    primary: role("primary"),
    onPrimary: role("onPrimary"),
    primaryContainer: role("primaryContainer"),
    onPrimaryContainer: role("onPrimaryContainer"),
    secondary: role("secondary"),
    onSecondary: role("onSecondary"),
    secondaryContainer: role("secondaryContainer"),
    onSecondaryContainer: role("onSecondaryContainer"),
    tertiary: role("tertiary"),
    onTertiary: role("onTertiary"),
    tertiaryContainer: role("tertiaryContainer"),
    onTertiaryContainer: role("onTertiaryContainer"),
    error: hexFromArgb(error.tone(dark ? 80 : 40)),
    onError: hexFromArgb(error.tone(dark ? 20 : 100)),
    errorContainer: hexFromArgb(error.tone(dark ? 30 : 90)),
    onErrorContainer: hexFromArgb(error.tone(dark ? 90 : 10)),
    success: hexFromArgb(success.tone(dark ? 80 : 40)),
    warning: hexFromArgb(warning.tone(dark ? 80 : 40)),
    surface: role("surface"),
    surfaceDim: role("surfaceDim"),
    surfaceBright: role("surfaceBright"),
    surfaceContainerLowest: role("surfaceContainerLowest"),
    surfaceContainerLow: role("surfaceContainerLow"),
    surfaceContainer: role("surfaceContainer"),
    surfaceContainerHigh: role("surfaceContainerHigh"),
    surfaceContainerHighest: role("surfaceContainerHighest"),
    onSurface: role("onSurface"),
    surfaceVariant: role("surfaceVariant"),
    onSurfaceVariant: role("onSurfaceVariant"),
    outline: role("outline"),
    outlineVariant: role("outlineVariant"),
    inverseSurface: role("inverseSurface"),
    inverseOnSurface: role("inverseOnSurface"),
    inversePrimary: role("inversePrimary"),
    inactiveFg: hexFromArgb(scheme.neutralPalette.tone(dark ? 60 : 50)),
  };

  const built: M3Scheme = {
    source,
    mode,
    roles,
    palettes: {
      primary: scheme.primaryPalette,
      secondary: scheme.secondaryPalette,
      tertiary: scheme.tertiaryPalette,
      error,
      neutral: scheme.neutralPalette,
      neutralVariant: scheme.neutralVariantPalette,
      success,
      warning,
      cyan,
    },
  };

  if (schemeCache.size >= SCHEME_CACHE_LIMIT) {
    const oldest = schemeCache.keys().next().value;
    if (oldest !== undefined) schemeCache.delete(oldest);
  }
  schemeCache.set(cacheKey, built);
  return built;
}

function kebab(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

export function schemeToCssVars(scheme: M3Scheme): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [k, v] of Object.entries(scheme.roles)) {
    vars[`--m3-${kebab(k)}`] = v;
  }
  return vars;
}

/** Whether text on a surface of this HCT tone should be dark */
export function toneIsDark(tone: number): boolean {
  return tone <= 60;
}
