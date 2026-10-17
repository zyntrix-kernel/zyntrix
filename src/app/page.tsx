"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useScroll, useSpring, MotionConfig } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { TopBar } from "@/components/m3/top-bar";
import { StorySection } from "@/components/story/story-section";
import { Customizer } from "@/components/m3/customizer";
import { DesktopPreview } from "@/components/m3/desktop-preview";
import { PaletteShowcase } from "@/components/m3/palette-showcase";
import { ComponentGallery } from "@/components/m3/component-gallery";
import { Downloads } from "@/components/m3/downloads";
import { InstallGuide } from "@/components/m3/install-guide";
import { Footer } from "@/components/m3/footer";
import {
  StateLayer,
  useInteractiveSurface,
} from "@/components/m3/interactive";
import {
  buildScheme,
  schemeToCssVars,
  DEFAULT_SOURCE,
  type M3Mode,
} from "@/lib/m3/theme";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Render discipline.
   A seed click used to reconcile the ENTIRE page (the 700vh story, the drag
   desktop, the gallery…) and then run a document-wide color-transition
   window — the lag users felt while switching presets. Now:

   • Memo'd sections bail out whenever their props are unchanged. Seed swaps
     re-render only the views that actually display seed data (story scene,
     customizer, downloads, palette); scroll-only state changes (back-to-top,
     footer observer) re-render almost nothing.
   • The retint beat itself costs ZERO React renders — it is a DOM attribute
     on the root plus one compositor-driven veil (globals.css).
--------------------------------------------------------------------------- */

const TopBarM = memo(TopBar);
const StorySectionM = memo(StorySection);
const CustomizerM = memo(Customizer);
const DesktopPreviewM = memo(DesktopPreview);
const PaletteShowcaseM = memo(PaletteShowcase);
const ComponentGalleryM = memo(ComponentGallery);
const DownloadsM = memo(Downloads);
const InstallGuideM = memo(InstallGuide);
const FooterM = memo(Footer);

export default function Home() {
  const [source, setSource] = useState<string>(DEFAULT_SOURCE);
  const [mode, setMode] = useState<M3Mode>("dark");
  const [showTop, setShowTop] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
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

  // Color-glide window — ZERO React renders. The root flips a data attribute
  // for the veil lifetime (globals.css owns the animation); rapid re-seeds
  // restart the beat by dropping the attribute, forcing a reflow, re-arming.
  const scheduleRetint = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    if (retintTimer.current) clearTimeout(retintTimer.current);
    el.removeAttribute("data-retint");
    void el.offsetWidth;
    el.setAttribute("data-retint", "true");
    retintTimer.current = setTimeout(() => {
      retintTimer.current = null;
      rootRef.current?.removeAttribute("data-retint");
    }, 560);
  }, []);

  useEffect(() => {
    return () => {
      if (retintTimer.current) clearTimeout(retintTimer.current);
      rootRef.current?.removeAttribute("data-retint");
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
        ref={rootRef}
        className="relative flex min-h-screen flex-col bg-[var(--m3-surface)] font-sans text-[var(--m3-on-surface)]"
        style={{ ...cssVars, colorScheme: mode }}
      >
        {/* Scroll progress — a lit filament with a theme-tinted glow head */}
        <motion.div
          aria-hidden="true"
          className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left rounded-r-full bg-gradient-to-r from-[var(--m3-primary)] via-[var(--m3-tertiary)] to-[var(--m3-primary)] shadow-[0_0_12px_color-mix(in_srgb,var(--m3-primary)_45%,transparent)]"
          style={{ scaleX: progress }}
        />

        <a
          href="#customize"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--m3-primary)] focus:px-4 focus:py-2 focus:text-[var(--m3-on-primary)]"
        >
          Skip the story — jump to the theme studio
        </a>

        <TopBarM mode={mode} onToggleMode={handleToggleMode} />

        <main className="flex-1">
          {/* CHAPTERS 00–06 — the story, told by actual UI components */}
          <StorySectionM
            source={source}
            mode={mode}
            scheme={scheme}
            onSourceChange={handleSourceChange}
            onModeChange={handleModeChange}
          />

          {/* THE WORKING STUDIO — the story hands off to the real thing */}
          <div className="relative z-10 bg-[var(--m3-surface)] shadow-[0_-24px_60px_rgba(0,0,0,0.35)]">
            {/* studio aurora — theme-derived radial washes + film grain give the
               working sections the same air as the story they follow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(52rem 34rem at 12% -2%, color-mix(in srgb, var(--m3-primary) 9%, transparent), transparent 62%)," +
                    "radial-gradient(46rem 30rem at 96% 22%, color-mix(in srgb, var(--m3-tertiary) 7%, transparent), transparent 58%)," +
                    "radial-gradient(60rem 40rem at 50% 108%, color-mix(in srgb, var(--m3-primary) 5%, transparent), transparent 60%)",
                }}
              />
              <div
                className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3\")",
                }}
              />
            </div>

            <CustomizerM
              source={source}
              onSourceChange={handleSourceChange}
              mode={mode}
              onModeChange={handleModeChange}
              roles={scheme.roles}
            />
            <DesktopPreviewM mode={mode} />
            <PaletteShowcaseM scheme={scheme} />
            <ComponentGalleryM />
            <DownloadsM source={source} mode={mode} />
            <InstallGuideM mode={mode} />
          </div>
        </main>

        <div ref={footerRef}>
          <FooterM mode={mode} />
        </div>

        {/* Back to top — magnetic, pointer-lit, arrow nudges upward */}
        <BackToTop show={showTop && !footerVisible} />
      </div>
    </MotionConfig>
  );
}

function BackToTop({ show }: { show: boolean }) {
  const { ref, surfaceProps } = useInteractiveSurface<HTMLAnchorElement>({
    magnet: 5,
    bloomRadius: 64,
  });
  return (
    <a
      ref={ref}
      href="#top"
      aria-label="Back to top"
      className={cn(
        "group fixed bottom-6 right-5 z-50 grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] shadow-xl transition-[opacity,translate,background-color,color,box-shadow] duration-300 [transition-timing-function:var(--ease-enter)] hover:bg-[var(--m3-primary)] hover:text-[var(--m3-on-primary)] hover:shadow-[0_10px_34px_color-mix(in_srgb,var(--m3-primary)_45%,transparent)] active:scale-95 sm:bottom-8 sm:right-8",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      )}
      {...surfaceProps}
      style={{ transitionProperty: "opacity, translate, background-color, color, box-shadow" }}
    >
      <StateLayer />
      <ArrowUp
        className="relative z-10 h-5 w-5 transition-transform duration-300 [transition-timing-function:var(--ease-spring)] group-hover:-translate-y-1"
        aria-hidden="true"
      />
    </a>
  );
}
