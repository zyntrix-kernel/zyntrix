"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/m3/top-bar";
import { Hero } from "@/components/m3/hero";
import { Customizer } from "@/components/m3/customizer";
import { DesktopPreview } from "@/components/m3/desktop-preview";
import { PaletteShowcase } from "@/components/m3/palette-showcase";
import { ComponentGallery } from "@/components/m3/component-gallery";
import { Downloads } from "@/components/m3/downloads";
import { InstallGuide } from "@/components/m3/install-guide";
import { Footer } from "@/components/m3/footer";
import {
  buildScheme,
  schemeToCssVars,
  DEFAULT_SOURCE,
  type M3Mode,
} from "@/lib/m3/theme";

export default function Home() {
  const [source, setSource] = useState<string>(DEFAULT_SOURCE);
  const [mode, setMode] = useState<M3Mode>("dark");

  const scheme = useMemo(() => buildScheme(source, mode), [source, mode]);
  const cssVars = useMemo(
    () => schemeToCssVars(scheme) as unknown as React.CSSProperties,
    [scheme]
  );

  return (
    <div
      id="top"
      className="m3-theme-transition flex min-h-screen flex-col bg-[var(--m3-surface)] font-sans text-[var(--m3-on-surface)]"
      style={cssVars}
    >
      <a
        href="#customize"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--m3-primary)] focus:px-4 focus:py-2 focus:text-[var(--m3-on-primary)]"
      >
        Skip to theme customizer
      </a>

      <TopBar mode={mode} onToggleMode={() => setMode(mode === "dark" ? "light" : "dark")} />

      <main className="flex-1">
        <Hero source={source} mode={mode} />
        <Customizer
          source={source}
          onSourceChange={setSource}
          mode={mode}
          onModeChange={setMode}
          roles={scheme.roles}
        />
        <DesktopPreview key={mode} mode={mode} />
        <PaletteShowcase scheme={scheme} />
        <ComponentGallery />
        <Downloads source={source} mode={mode} />
        <InstallGuide mode={mode} />
      </main>

      <Footer mode={mode} />
    </div>
  );
}
