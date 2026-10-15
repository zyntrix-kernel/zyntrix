import path from "node:path";
import fs from "node:fs";
import { TarArchive } from "archiver";
import { buildScheme, normalizeHex, WALLPAPER_FILES, type M3Mode } from "./theme";

export { WALLPAPER_FILES };

const rgb = (hex: string): string => {
  const n = parseInt(hex.replace("#", ""), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};

export const SCHEME_NAME_LIGHT = "M3KubuntuLight";
export const SCHEME_NAME_DARK = "M3KubuntuDark";

/**
 * Generates a complete KDE Plasma color scheme (.colors, KConfig format)
 * that maps Material 3 roles onto the KColorScheme color sets.
 */
export function kdeColorScheme(sourceHex: string, mode: M3Mode): string {
  const { roles: r } = buildScheme(sourceHex, mode);
  const name = mode === "dark" ? SCHEME_NAME_DARK : SCHEME_NAME_LIGHT;
  const dark = mode === "dark";

  const focus = r.primary;
  const hover = r.primary;
  const inactive = r.inactiveFg;
  const link = r.primary;
  const visited = r.tertiary;
  const negative = r.error;
  const positive = r.success;
  const neutral = r.warning;

  // Accents that sit on top of the (inverted) tooltip surface
  const other = buildScheme(sourceHex, dark ? "light" : "dark").roles;
  const tooltipAccent = {
    negative: rgb(other.error),
    positive: rgb(other.success),
    neutral: rgb(other.warning),
  };

  return `[General]
Name=${name}
Version=0.1
shade_sort_column=true

[KDE]
widgetStyle=breeze

[Color: Background]
BackgroundAlternate=${rgb(r.surfaceContainer)}
BackgroundNormal=${rgb(r.surface)}
DecorationFocus=${rgb(focus)}
DecorationHover=${rgb(hover)}
ForegroundActive=${rgb(r.primary)}
ForegroundInactive=${rgb(inactive)}
ForegroundLink=${rgb(link)}
ForegroundNegative=${rgb(negative)}
ForegroundNeutral=${rgb(neutral)}
ForegroundNormal=${rgb(r.onSurface)}
ForegroundPositive=${rgb(positive)}
ForegroundVisited=${rgb(visited)}

[Color: Complementary]
BackgroundAlternate=${rgb(r.surfaceContainerHigh)}
BackgroundNormal=${rgb(r.surfaceContainerLow)}
DecorationFocus=${rgb(focus)}
DecorationHover=${rgb(hover)}
ForegroundActive=${rgb(r.primary)}
ForegroundInactive=${rgb(r.onSurfaceVariant)}
ForegroundLink=${rgb(link)}
ForegroundNegative=${rgb(negative)}
ForegroundNeutral=${rgb(neutral)}
ForegroundNormal=${rgb(r.onSurface)}
ForegroundPositive=${rgb(positive)}
ForegroundVisited=${rgb(visited)}

[Color: Header]
BackgroundAlternate=${rgb(r.surfaceContainerHigh)}
BackgroundNormal=${rgb(r.surfaceContainer)}
DecorationFocus=${rgb(focus)}
DecorationHover=${rgb(hover)}
ForegroundActive=${rgb(r.primary)}
ForegroundInactive=${rgb(inactive)}
ForegroundLink=${rgb(link)}
ForegroundNegative=${rgb(negative)}
ForegroundNeutral=${rgb(neutral)}
ForegroundNormal=${rgb(r.onSurface)}
ForegroundPositive=${rgb(positive)}
ForegroundVisited=${rgb(visited)}

[Color: Selection]
BackgroundAlternate=${rgb(r.primaryContainer)}
BackgroundNormal=${rgb(r.primary)}
ForegroundActive=${rgb(r.onPrimary)}
ForegroundInactive=${rgb(r.onPrimary)}
ForegroundLink=${rgb(r.onPrimary)}
ForegroundNegative=${rgb(r.onPrimary)}
ForegroundNeutral=${rgb(r.onPrimary)}
ForegroundNormal=${rgb(r.onPrimary)}
ForegroundPositive=${rgb(r.onPrimary)}
ForegroundVisited=${rgb(r.onPrimary)}

[Color: Tooltip]
BackgroundAlternate=${rgb(r.inverseSurface)}
BackgroundNormal=${rgb(r.inverseSurface)}
ForegroundActive=${rgb(r.inverseOnSurface)}
ForegroundInactive=${rgb(r.inverseOnSurface)}
ForegroundLink=${rgb(r.inverseOnSurface)}
ForegroundNegative=${tooltipAccent.negative}
ForegroundNeutral=${tooltipAccent.neutral}
ForegroundNormal=${rgb(r.inverseOnSurface)}
ForegroundPositive=${tooltipAccent.positive}
ForegroundVisited=${rgb(r.inverseOnSurface)}

[Color: Window]
BackgroundAlternate=${rgb(r.surfaceContainerLow)}
BackgroundNormal=${rgb(r.surface)}
DecorationFocus=${rgb(focus)}
DecorationHover=${rgb(hover)}
ForegroundActive=${rgb(r.primary)}
ForegroundInactive=${rgb(inactive)}
ForegroundLink=${rgb(link)}
ForegroundNegative=${rgb(negative)}
ForegroundNeutral=${rgb(neutral)}
ForegroundNormal=${rgb(r.onSurface)}
ForegroundPositive=${rgb(positive)}
ForegroundVisited=${rgb(visited)}

[Color: Button]
BackgroundAlternate=${rgb(r.surfaceContainerHighest)}
BackgroundNormal=${rgb(r.surfaceContainerHigh)}
DecorationFocus=${rgb(focus)}
DecorationHover=${rgb(hover)}
ForegroundActive=${rgb(r.primary)}
ForegroundInactive=${rgb(inactive)}
ForegroundLink=${rgb(link)}
ForegroundNegative=${rgb(negative)}
ForegroundNeutral=${rgb(neutral)}
ForegroundNormal=${rgb(r.onSurface)}
ForegroundPositive=${rgb(positive)}
ForegroundVisited=${rgb(visited)}
`;
}

function buildRolesFor(mode: M3Mode, sourceHex: string) {
  return buildScheme(sourceHex, mode).roles;
}

/**
 * Konsole color scheme (.colorscheme) derived from the M3 palette.
 */
export function konsoleScheme(sourceHex: string, mode: M3Mode): string {
  const s = buildScheme(sourceHex, mode);
  const p = s.palettes;
  const dark = mode === "dark";
  const c = (hex: string) => rgb(hex);

  const bg = s.roles.surface;
  const bgIntense = dark ? toneHex(p.neutral, 10) : toneHex(p.neutral, 92);
  const bgFaint = dark ? toneHex(p.neutral, 4) : toneHex(p.neutral, 100);
  const fg = s.roles.onSurface;
  const fgIntense = dark ? toneHex(p.neutral, 98) : toneHex(p.neutral, 0);
  const fgFaint = s.roles.onSurfaceVariant;

  const baseTone = dark ? 80 : 45;
  const intenseTone = dark ? 90 : 35;
  const faintTone = dark ? 70 : 55;

  const color = (i: number) => [
    toneHex(p.neutral, dark ? 25 : 15), // 0 black
    toneHex(p.error, baseTone), //        1 red
    toneHex(p.success, baseTone), //      2 green
    toneHex(p.warning, baseTone), //      3 yellow
    s.roles.primary, //                   4 blue  (= M3 primary)
    s.roles.tertiary, //                  5 magenta
    toneHex(p.cyan, baseTone), //         6 cyan
    toneHex(p.neutral, dark ? 85 : 60), //7 white
  ][i];

  const colorIntense = (i: number) => [
    toneHex(p.neutral, dark ? 40 : 25),
    toneHex(p.error, intenseTone),
    toneHex(p.success, intenseTone),
    toneHex(p.warning, intenseTone),
    dark ? s.roles.primary : toneHex(p.primary, 30),
    dark ? s.roles.tertiary : toneHex(p.tertiary, 30),
    toneHex(p.cyan, intenseTone),
    toneHex(p.neutral, dark ? 95 : 45),
  ][i];

  const colorFaint = (i: number) => [
    toneHex(p.neutral, dark ? 18 : 30),
    toneHex(p.error, faintTone),
    toneHex(p.success, faintTone),
    toneHex(p.warning, faintTone),
    dark ? toneHex(p.primary, 70) : toneHex(p.primary, 60),
    dark ? toneHex(p.tertiary, 70) : toneHex(p.tertiary, 60),
    toneHex(p.cyan, faintTone),
    toneHex(p.neutral, dark ? 70 : 75),
  ][i];

  const name = mode === "dark" ? "M3 Kubuntu Dark" : "M3 Kubuntu Light";

  const lines: string[] = [
    "[General]",
    `Description=${name}`,
    "Opacity=1",
    "Wallpaper=",
    "",
    "[Background]",
    `Color=${c(bg)}`,
    "",
    "[BackgroundFaint]",
    `Color=${c(bgFaint)}`,
    "",
    "[BackgroundIntense]",
    `Color=${c(bgIntense)}`,
    "",
    "[Foreground]",
    `Color=${c(fg)}`,
    "",
    "[ForegroundFaint]",
    `Color=${c(fgFaint)}`,
    "",
    "[ForegroundIntense]",
    `Color=${c(fgIntense)}`,
  ];

  for (let i = 0; i < 8; i++) {
    lines.push(
      "",
      `[Color${i}]`,
      `Color=${color(i)}`,
      "",
      `[Color${i}Faint]`,
      `Color=${colorFaint(i)}`,
      "",
      `[Color${i}Intense]`,
      `Color=${colorIntense(i)}`
    );
  }
  return lines.join("\n") + "\n";
}

// Local helpers (imported lazily to keep the module tidy)
import { hexFromArgb as hexFromArgbLocal } from "@material/material-color-utilities";
import type { TonalPalette } from "@material/material-color-utilities";
function toneHex(p: TonalPalette, tone: number): string {
  return hexFromArgbLocal(p.tone(tone));
}

/**
 * Self-contained installer that places every artifact into the right
 * ~/.local/share location and applies the theme via plasma CLI tools.
 */
export function installScript(sourceHex: string, mode: M3Mode): string {
  const source = normalizeHex(sourceHex);
  const schemeName = mode === "dark" ? SCHEME_NAME_DARK : SCHEME_NAME_LIGHT;
  const wallpaper = mode === "dark" ? WALLPAPER_FILES[1] : WALLPAPER_FILES[0];
  return `#!/usr/bin/env bash
# M3 Kubuntu - Material 3 global theme installer
# Source color: ${source} (apply this exact package to re-generate identical files)
set -euo pipefail

THEME_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
XDG_DATA_HOME="\${XDG_DATA_HOME:-$HOME/.local/share}"

echo "==> Installing M3 Kubuntu color schemes..."
mkdir -p "$XDG_DATA_HOME/color-schemes"
cp "$THEME_DIR/color-schemes/"*.colors "$XDG_DATA_HOME/color-schemes/"

echo "==> Installing Konsole color schemes..."
mkdir -p "$XDG_DATA_HOME/konsole"
cp "$THEME_DIR/konsole/"*.colorscheme "$XDG_DATA_HOME/konsole/"

echo "==> Installing wallpapers..."
mkdir -p "$XDG_DATA_HOME/wallpapers/M3Kubuntu/contents/images"
cp "$THEME_DIR/wallpapers/"*.png "$XDG_DATA_HOME/wallpapers/M3Kubuntu/contents/images/"
cp "$THEME_DIR/wallpapers/M3Kubuntu.metadata.json" \\
   "$XDG_DATA_HOME/wallpapers/M3Kubuntu/metadata.json"

echo "==> Installing look-and-feel package..."
mkdir -p "$XDG_DATA_HOME/plasma/look-and-feel"
rm -rf "$XDG_DATA_HOME/plasma/look-and-feel/M3Kubuntu"
cp -r "$THEME_DIR/plasma/look-and-feel/M3Kubuntu" "$XDG_DATA_HOME/plasma/look-and-feel/"

if command -v plasma-apply-colorscheme >/dev/null 2>&1; then
  echo "==> Applying color scheme (${schemeName})..."
  plasma-apply-colorscheme ${schemeName} || true
  plasma-apply-colorscheme ${SCHEME_NAME_LIGHT} >/dev/null 2>&1 || true
  plasma-apply-colorscheme ${schemeName} || true
fi

if command -v plasma-apply-wallpaperimage >/dev/null 2>&1; then
  echo "==> Applying wallpaper..."
  plasma-apply-wallpaperimage \\
    "$XDG_DATA_HOME/wallpapers/M3Kubuntu/contents/images/${wallpaper}" || true
fi

cat <<'EOF'

  Material 3 theme installed!

  Next steps:
    * Colors:   System Settings > Colors & Themes > Colors > "M3 Kubuntu"
    * Wallpaper: right-click the desktop > Configure Desktop and Wallpaper
      > pick "M3 Kubuntu"
    * Konsole:  Settings > Edit Current Profile > Appearance > "M3 Kubuntu"
    * Re-run with your other package to switch accent seeds.

EOF
`;
}

export function uninstallScript(): string {
  return `#!/usr/bin/env bash
# Removes the M3 Kubuntu theme files from your user profile.
set -euo pipefail
XDG_DATA_HOME="\${XDG_DATA_HOME:-$HOME/.local/share}"

rm -f "$XDG_DATA_HOME/color-schemes/M3KubuntuLight.colors"
rm -f "$XDG_DATA_HOME/color-schemes/M3KubuntuDark.colors"
rm -f "$XDG_DATA_HOME/konsole/M3KubuntuLight.colorscheme"
rm -f "$XDG_DATA_HOME/konsole/M3KubuntuDark.colorscheme"
rm -rf "$XDG_DATA_HOME/wallpapers/M3Kubuntu"
rm -rf "$XDG_DATA_HOME/plasma/look-and-feel/M3Kubuntu"

echo "M3 Kubuntu theme removed. Switch back to Breeze in System Settings."
`;
}

export function readmeMd(sourceHex: string, mode: M3Mode): string {
  return `# M3 Kubuntu - Material 3 Global Theme

A complete Material You / Material 3 theme package for Kubuntu (KDE Plasma 5.27+ / Plasma 6).

- Seed color: **${normalizeHex(sourceHex)}**
- Default scheme: **${mode === "dark" ? SCHEME_NAME_DARK : SCHEME_NAME_LIGHT}**
- Generated by the M3 Theme Studio (Material color engine, tonal palettes)

## Contents

| Path | Purpose |
| --- | --- |
| \`color-schemes/\` | KDE color schemes (light + dark) for all Qt/KDE apps and Plasma |
| \`konsole/\` | Matching Konsole terminal color schemes |
| \`wallpapers/\` | 3 AI-generated Material You wallpapers + wallpaper package metadata |
| \`plasma/look-and-feel/M3Kubuntu/\` | Global Theme entry pointing at the M3 scheme + wallpaper |
| \`install.sh\` | One-shot installer (user level, no root required) |
| \`uninstall.sh\` | Clean removal |

## Install

\`\`\`bash
chmod +x install.sh uninstall.sh
./install.sh
\`\`\`

No root required - everything installs into \`~/.local/share\`.

## Apply manually

\`\`\`bash
plasma-apply-colorscheme ${mode === "dark" ? SCHEME_NAME_DARK : SCHEME_NAME_LIGHT}
plasma-apply-wallpaperimage ~/.local/share/wallpapers/M3Kubuntu/contents/images/${mode === "dark" ? WALLPAPER_FILES[1] : WALLPAPER_FILES[0]}
\`\`\`

Or via the GUI: **System Settings > Colors & Themes > Colors > M3 Kubuntu**.

## Recommended extras for the full Material 3 look

\`\`\`bash
sudo apt install papirus-icon-theme kvantum
\`\`\`

- **Icons**: Papirus (rounded, M3-friendly) - System Settings > Icons
- **Window decorations**: "Klassy" or "Classik" from System Settings >
  Window Decorations > Get New... enable large corner radii (12-16 px)
- **Widget style**: keep Breeze (the color scheme already carries the M3 palette)

## License

Color schemes generated from the Apache-2.0 material-color-utilities engine.
Wallpapers generated with AI - free to use and share (CC0).
`;
}

const WALLPAPER_METADATA = JSON.stringify(
  {
    KPlugin: {
      Id: "M3Kubuntu",
      Name: "M3 Kubuntu",
      License: "CC0",
      Version: "1.0",
      Authors: [{ Name: "M3 Theme Studio" }],
    },
  },
  null,
  2
);

const LOOK_AND_FEEL_METADATA = JSON.stringify(
  {
    KPlugin: {
      Id: "M3Kubuntu",
      Name: "M3 Kubuntu",
      Description: "Material 3 global theme for Kubuntu",
      License: "GPL-3.0",
      Version: "1.0",
      ServiceTypes: ["Plasma/LookAndFeel"],
      Authors: [{ Name: "M3 Theme Studio" }],
    },
    KPackageStructure: "Plasma/LookAndFeel",
  },
  null,
  2
);

function lookAndFeelDefaults(mode: M3Mode): string {
  const wallpaper = mode === "dark" ? WALLPAPER_FILES[1] : WALLPAPER_FILES[0];
  return `[kdeglobals][General]
ColorScheme=${mode === "dark" ? SCHEME_NAME_DARK : SCHEME_NAME_LIGHT}
Name=M3 Kubuntu

[kdeglobals][KDE]
widgetStyle=breeze

[kdeglobals][Icons]
Theme=breeze

[plasmashellrc][Containments][1][Wallpaper][org.kde.image][General]
Image=file://$XDG_DATA_HOME/wallpapers/M3Kubuntu/contents/images/${wallpaper}
`;
}

/**
 * Builds the complete downloadable theme package (.tar.gz) containing
 * color schemes, Konsole schemes, wallpapers, look-and-feel and installer.
 */
export async function buildThemePackage(
  sourceHex: string,
  mode: M3Mode
): Promise<Buffer> {
  const source = normalizeHex(sourceHex);
  const archive = new TarArchive({ gzip: true, gzipOptions: { level: 6 } });
  const chunks: Buffer[] = [];
  archive.on("data", (chunk: Buffer) => chunks.push(chunk));
  const closed = new Promise<void>((resolve, reject) => {
    archive.on("close", () => resolve());
    archive.on("error", reject);
    archive.on("warning", (err) => {
      if ((err as { code?: string }).code !== "ENOENT") reject(err);
    });
  });

  const add = (name: string, content: string, exec = false) =>
    archive.append(content, {
      name: `m3-kubuntu/${name}`,
      ...(exec ? { mode: 0o755 as const } : {}),
    });

  add("color-schemes/M3KubuntuLight.colors", kdeColorScheme(source, "light"));
  add("color-schemes/M3KubuntuDark.colors", kdeColorScheme(source, "dark"));
  add("konsole/M3KubuntuLight.colorscheme", konsoleScheme(source, "light"));
  add("konsole/M3KubuntuDark.colorscheme", konsoleScheme(source, "dark"));
  add("wallpapers/M3Kubuntu.metadata.json", WALLPAPER_METADATA);
  add("plasma/look-and-feel/M3Kubuntu/metadata.json", LOOK_AND_FEEL_METADATA);
  add(
    "plasma/look-and-feel/M3Kubuntu/contents/defaults",
    lookAndFeelDefaults(mode)
  );
  add("install.sh", installScript(source, mode), true);
  add("uninstall.sh", uninstallScript(), true);
  add("README.md", readmeMd(source, mode));

  const wallDir = path.join(process.cwd(), "public", "wallpapers");
  if (fs.existsSync(wallDir)) {
    for (const f of WALLPAPER_FILES) {
      const p = path.join(wallDir, f);
      if (fs.existsSync(p)) {
        archive.file(p, { name: `m3-kubuntu/wallpapers/${f}` });
      }
    }
  }

  await archive.finalize();
  await closed;
  return Buffer.concat(chunks);
}
