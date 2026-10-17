"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useSpring, MotionConfig } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { TopBar } from "@/components/m3/top-bar";
import { FilmSection } from "@/components/cinema/film-section";
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
import { cn } from "@/lib/utils";

export default function Home() {
  const [source, setSource] = useState<string>(DEFAULT_SOURCE);
  const [mode, setMode] = useState<M3Mode>("dark");
  const [showTop, setShowTop] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [retinting, setRetinting] = useState(false);
  const retintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);

  const scheme = useMemo(() => buildScheme(source, mode), [source, mode]);
  const cssVars = useMemo(
    () => schemeToCssVars(scheme) as unknown as React.CSSProperties,
    [scheme]
  );

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.4,
  });

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Retire the back-to-top button while the footer is on screen — it would
  // otherwise float over the footer nav on small viewports.
  useEffect(() => {
    const el = footerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { rootMargin: "0px 0px -12px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Color-glide window: opened by user interactions that change theme identity.
  const scheduleRetint = useCallback(() => {
    setRetinting(true);
    if (retintTimer.current) clearTimeout(retintTimer.current);
    retintTimer.current = setTimeout(() => setRetinting(false), 460);
  }, []);

  useEffect(() => {
    return () => {
      if (retintTimer.current) clearTimeout(retintTimer.current);
    };
  }, []);

  const handleSourceChange = useCallback(
    (hex: string) => {
      scheduleRetint();
      setSource(hex);
    },
    [scheduleRetint]
  );
  const handleModeChange = useCallback(
    (m: M3Mode) => {
      scheduleRetint();
      setMode(m);
    },
    [scheduleRetint]
  );
  const handleToggleMode = useCallback(() => {
    scheduleRetint();
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  }, [scheduleRetint]);

  return (
    <MotionConfig reducedMotion="user">
      <div
        id="top"
        data-retint={retinting ? "true" : "false"}
        className="relative flex min-h-screen flex-col bg-[var(--m3-surface)] font-sans text-[var(--m3-on-surface)]"
        style={{ ...cssVars, colorScheme: mode }}
      >
        {/* Scroll progress */}
        <motion.div
          aria-hidden="true"
          className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-[var(--m3-primary)] via-[var(--m3-tertiary)] to-[var(--m3-primary)]"
          style={{ scaleX: progress }}
        />

        <a
          href="#customize"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--m3-primary)] focus:px-4 focus:py-2 focus:text-[var(--m3-on-primary)]"
        >
          Skip the film — jump to the theme studio
        </a>

        <TopBar mode={mode} onToggleMode={handleToggleMode} />

        <main className="flex-1">
          {/* SEQUENCES 00–08 — the cinematic journey (WebGL or poster) */}
          <FilmSection
            source={source}
            mode={mode}
            onSourceChange={handleSourceChange}
            onModeChange={handleModeChange}
          />

          {/* SEQUENCE 09 — the working studio, opaque over the film */}
          <div className="relative z-10 bg-[var(--m3-surface)] shadow-[0_-24px_60px_rgba(0,0,0,0.35)]">
            <Customizer
              source={source}
              onSourceChange={handleSourceChange}
              mode={mode}
              onModeChange={handleModeChange}
              roles={scheme.roles}
            />
            <DesktopPreview mode={mode} />
            <PaletteShowcase scheme={scheme} />
            <ComponentGallery />
            <Downloads source={source} mode={mode} />
            <InstallGuide mode={mode} />
          </div>
        </main>

        <div ref={footerRef}>
          <Footer mode={mode} />
        </div>

        {/* Back to top */}
        <a
          href="#top"
          aria-label="Back to top"
          className={cn(
            "fixed bottom-6 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] shadow-xl transition-[opacity,transform,background-color,color] duration-300 [transition-timing-function:var(--ease-enter)] hover:bg-[var(--m3-primary)] hover:text-[var(--m3-on-primary)] active:scale-95 sm:bottom-8 sm:right-8",
            showTop && !footerVisible
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-6 opacity-0"
          )}
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </a>
      </div>
    </MotionConfig>
  );
}
