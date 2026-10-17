"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useScroll, useReducedMotion } from "framer-motion";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { CHAPTERS } from "@/lib/cinema/world";
import type { FilmEngine } from "@/lib/cinema/engine";
import { buildScheme, SEED_PRESETS, toneToHex, type M3Mode, type M3Scheme } from "@/lib/m3/theme";
import { cn } from "@/lib/utils";

const FilmCanvas = dynamic(() => import("./film-canvas"), { ssr: false });

/* The film track: 9 chapters × 100vh of authored journey */
const TRACK_CHAPTERS = 9;
const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------------------- chapter copy (real text) ---------------------- */

interface ChapterCopy {
  no: string;
  title: string;
  lead: string;
  align: "left" | "center" | "right";
}

const COPY: ChapterCopy[] = [
  {
    no: "00",
    title: "Zyntrix",
    lead: "Material 3 for Kubuntu, generated from a single seed color.",
    align: "center",
  },
  {
    no: "01",
    title: "One seed. One system.",
    lead: "Scroll to enter the studio floor. Every surface ahead obeys your color.",
    align: "left",
  },
  {
    no: "02",
    title: "The theme engine",
    lead: "HCT — hue, chroma, tone. Your seed becomes tonal palettes, then 43 Material roles.",
    align: "left",
  },
  {
    no: "03",
    title: "The instrument chamber",
    lead: "Tune the seed and mode live — the world re-tints as you work.",
    align: "left",
  },
  {
    no: "04",
    title: "The desktop materializes",
    lead: "A Plasma display assembles from machined layers, powered by the same scheme.",
    align: "center",
  },
  {
    no: "05",
    title: "The product film",
    lead: "Seed → apply → system-wide. Watch it land, then reverse it — it's all scroll.",
    align: "right",
  },
  {
    no: "06",
    title: "Hardware revelation",
    lead: "The machine dissects itself: display, board, silicon, thermal, power.",
    align: "center",
  },
  {
    no: "07",
    title: "Enter the system",
    lead: "Through the screen — wallpaper, panel, windows and dock as dimensional layers.",
    align: "left",
  },
  {
    no: "08",
    title: "This is Zyntrix",
    lead: "43 roles · 3 wallpapers · Konsole schemes · one command. The studio awaits.",
    align: "center",
  },
];

/* ---------------------------- component ---------------------------- */

export function FilmSection({
  source,
  mode,
  onSourceChange,
  onModeChange,
}: {
  source: string;
  mode: M3Mode;
  onSourceChange: (hex: string) => void;
  onModeChange: (m: M3Mode) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const engineRef = useRef<FilmEngine | null>(null);
  const [chapter, setChapter] = useState(0);
  const [glUnavailable, setGlUnavailable] = useState(false);
  const [trackActive, setTrackActive] = useState(true);
  const reducedMotion = useReducedMotion();
  const poster = reducedMotion === true || glUnavailable;

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  /* Hot path: progress flows to the engine through refs. No React renders. */
  useEffect(() => {
    const apply = (v: number) => {
      progressRef.current = v;
      engineRef.current?.setProgress(v);
    };
    apply(scrollYProgress.get());
    return scrollYProgress.on("change", apply);
  }, [scrollYProgress]);

  /* Engine lifecycle follows visibility — GPU is freed once the film is gone */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || poster) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setTrackActive(entry.isIntersecting);
        if (entry.isIntersecting) engineRef.current?.start();
        else engineRef.current?.stop();
      },
      { rootMargin: "10% 0px 10% 0px" }
    );
    io.observe(track);
    const onVis = () => {
      if (document.hidden) engineRef.current?.stop();
      else if (trackActive) engineRef.current?.start();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [poster, trackActive]);

  const jumpToChapter = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const c = CHAPTERS[i];
    const top = track.offsetTop + c.start * track.clientHeight + 4;
    window.scrollTo({ top, behavior: "auto" });
  }, []);

  const handleEngine = useCallback((engine: FilmEngine | null) => {
    engineRef.current = engine;
  }, []);

  const handleChapter = useCallback((c: number) => setChapter(c), []);

  if (poster) {
    return (
      <FilmPoster
        source={source}
        mode={mode}
        onSourceChange={onSourceChange}
        onModeChange={onModeChange}
      />
    );
  }

  const copy = COPY[chapter];

  return (
    <div
      ref={trackRef}
      style={{ height: `${TRACK_CHAPTERS * 100}vh` }}
      className="relative"
      data-testid="film-track"
    >
      <FilmCanvas
        source={source}
        mode={mode}
        progressRef={progressRef}
        reducedMotion={false}
        onEngine={handleEngine}
        onUnavailable={() => setGlUnavailable(true)}
        onChapter={handleChapter}
      />

      {/* sticky stage — overlays live here while the film plays */}
      <div className="pointer-events-none sticky top-0 z-10 h-screen">
        {/* legibility gradients */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 to-transparent"
        />

        {/* chapter copy */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={chapter}
            aria-live="polite"
            aria-label={`Chapter ${copy.no}: ${copy.title}`}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.55, ease: EASE }}
            className={cn(
              "absolute inset-x-0 bottom-[12vh] px-6 sm:px-10",
              copy.align === "center" && "text-center",
              copy.align === "right" && "text-right"
            )}
          >
            <p className="font-mono text-xs tracking-[0.3em] text-white/60">
              {copy.no} · {CHAPTERS[chapter].title.toUpperCase()}
            </p>
            {copy.no === "00" ? (
              <h1 className="mx-auto mt-3 max-w-3xl text-balance text-5xl font-medium leading-[1.05] text-white sm:text-7xl">
                {copy.title}
              </h1>
            ) : (
              <h2
                className={cn(
                  "mt-3 max-w-md text-balance text-3xl font-medium leading-tight text-white sm:text-4xl",
                  copy.align === "center" && "mx-auto",
                  copy.align === "right" && "ml-auto"
                )}
              >
                {copy.title}
              </h2>
            )}
            <p
              className={cn(
                "mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:text-base",
                copy.align === "center" && "mx-auto",
                copy.align === "right" && "ml-auto"
              )}
            >
              {copy.lead}
            </p>

            {/* Chapter 03 HUD — the real controls, bound to real state */}
            {chapter === 3 && (
              <div className="pointer-events-auto mt-6 inline-block rounded-3xl bg-black/45 p-4 backdrop-blur-xl sm:p-5">
                <SeedHUD
                  source={source}
                  mode={mode}
                  onSourceChange={onSourceChange}
                  onModeChange={onModeChange}
                />
              </div>
            )}

            {/* Chapter 08 CTA */}
            {chapter === 8 && (
              <div className="pointer-events-auto mt-7">
                <a
                  href="#customize"
                  className="m3-btn m3-btn-filled m3-btn-lg font-sans"
                >
                  Enter the studio
                  <ChevronDown className="h-5 w-5" aria-hidden="true" />
                </a>
              </div>
            )}

            {/* Chapter 00 scroll cue */}
            {chapter === 0 && (
              <motion.div
                aria-hidden="true"
                className="mt-9 flex justify-center"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown className="h-6 w-6 text-white/70" />
              </motion.div>
            )}
          </motion.section>
        </AnimatePresence>

        {/* chapter navigation rail */}
        <nav
          aria-label="Film chapters"
          className="pointer-events-auto absolute right-3 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-2.5 sm:right-5 md:flex"
        >
          {CHAPTERS.map((c, i) => (
            <button
              key={c.id}
              onClick={() => jumpToChapter(i)}
              aria-current={chapter === i ? "true" : undefined}
              aria-label={`Jump to chapter ${COPY[i].no}: ${c.title}`}
              className="group flex items-center gap-2.5 outline-offset-4"
            >
              <span
                className={cn(
                  "font-mono text-[10px] tracking-widest transition-all duration-300",
                  chapter === i
                    ? "text-white/90 opacity-100"
                    : "text-white/50 opacity-0 group-hover:opacity-100"
                )}
              >
                {COPY[i].no}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "h-[3px] rounded-full transition-all duration-500 [transition-timing-function:var(--ease-enter)]",
                  chapter === i ? "w-8 bg-white" : "w-3 bg-white/40 group-hover:bg-white/70"
                )}
              />
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

/* --------------------------- the live HUD --------------------------- */

function SeedHUD({
  source,
  mode,
  onSourceChange,
  onModeChange,
  variant = "glass",
}: {
  source: string;
  mode: M3Mode;
  onSourceChange: (hex: string) => void;
  onModeChange: (m: M3Mode) => void;
  variant?: "glass" | "surface";
}) {
  const glass = variant === "glass";
  return (
    <div>
      <p
        className={cn(
          "font-mono text-[10px] tracking-[0.25em] tabular-nums",
          glass ? "text-white/60" : "text-[var(--m3-on-surface-variant)]"
        )}
      >
        LIVE SOURCE · {source.toUpperCase()}
      </p>
      <div role="group" aria-label="Seed color presets" className="mt-3 flex flex-wrap gap-2">
        {SEED_PRESETS.map((p) => (
          <button
            key={p.hex}
            onClick={() => onSourceChange(p.hex)}
            aria-pressed={source === p.hex}
            aria-label={`Seed ${p.name}`}
            title={p.name}
            className={cn(
              "h-8 w-8 rounded-full transition-transform duration-200 [transition-timing-function:var(--ease-spring)] hover:scale-110",
              source === p.hex &&
                (glass
                  ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-black/40"
                  : "scale-110 ring-2 ring-[var(--m3-on-surface)] ring-offset-2 ring-offset-[var(--m3-surface-container)]")
            )}
            style={{ background: p.hex }}
          />
        ))}
      </div>
      <div
        role="group"
        aria-label="Theme mode"
        className={cn(
          "mt-3.5 inline-flex rounded-full p-0.5",
          glass ? "border border-white/15" : "border border-[var(--m3-outline-variant)]"
        )}
      >
        {(["dark", "light"] as const).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            aria-pressed={mode === m}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors duration-200",
              mode === m
                ? glass
                  ? "bg-white text-black"
                  : "bg-[var(--m3-primary)] text-[var(--m3-on-primary)]"
                : glass
                  ? "text-white/70 hover:text-white"
                  : "text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-on-surface)]"
            )}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------ poster (fallback) ------------------------ */
/* Reduced-motion and no-WebGL visitors get a composed, fully static
   telling of the same nine chapters — same copy, same narrative. */

function FilmPoster({
  source,
  mode,
  onSourceChange,
  onModeChange,
}: {
  source: string;
  mode: M3Mode;
  onSourceChange: (hex: string) => void;
  onModeChange: (m: M3Mode) => void;
}) {
  const scheme = buildScheme(source, mode);
  return (
    <div className="relative z-10" data-testid="film-poster">
      {COPY.map((c, i) => (
        <section
          key={c.no}
          aria-label={`Chapter ${c.no}: ${c.title}`}
          className={cn(
            "border-b border-[var(--m3-outline-variant)] px-6 py-16 sm:px-10",
            i === 0 && "pt-20"
          )}
        >
          <p className="font-mono text-xs tracking-[0.3em] text-[var(--m3-on-surface-variant)]">
            {c.no} · {CHAPTERS[i].title.toUpperCase()}
          </p>
          {i === 0 ? (
            <h1 className="mt-3 text-5xl font-medium text-[var(--m3-on-surface)] sm:text-6xl">
              {c.title}
            </h1>
          ) : (
            <h2 className="mt-3 text-3xl font-medium text-[var(--m3-on-surface)] sm:text-4xl">
              {c.title}
            </h2>
          )}
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--m3-on-surface-variant)] sm:text-base">
            {c.lead}
          </p>

          {/* static tonal strip — the chapter's visual echo, from real HCT palettes */}
          <TonalStrip scheme={scheme} index={i} />

          {i === 3 && (
            <div className="mt-6 inline-block rounded-3xl border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)] p-4 sm:p-5">
              <SeedHUD
                source={source}
                mode={mode}
                onSourceChange={onSourceChange}
                onModeChange={onModeChange}
                variant="surface"
              />
            </div>
          )}
          {i === 8 && (
            <div className="mt-7">
              <a href="#customize" className="m3-btn m3-btn-filled m3-btn-lg">
                Enter the studio
                <ChevronDown className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function TonalStrip({ scheme, index }: { scheme: M3Scheme; index: number }) {
  const ramps = ["primary", "secondary", "tertiary", "neutral"] as const;
  const tones = [95, 80, 60, 40, 20];
  const hex = (ramp: (typeof ramps)[number], t: number) =>
    toneToHex(scheme.palettes[ramp], t);
  return (
    <div aria-hidden="true" className="mt-6 flex flex-wrap gap-1.5">
      {ramps.map((r) => (
        <div key={r} className="flex gap-1">
          {tones.map((t) => (
            <span
              key={`${r}-${t}`}
              className="h-2.5 w-7 rounded-full sm:w-9"
              style={{ background: hex(r, index % 2 === 0 ? t : t + 5) }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
