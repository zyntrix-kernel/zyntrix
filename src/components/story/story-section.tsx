"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowDown,
  BatteryMedium,
  Check,
  ChevronDown,
  Folder,
  Music,
  Palette,
  Settings,
  Sparkles,
  SquareTerminal,
  Volume2,
  Wifi,
} from "lucide-react";
import { Hct, argbFromHex } from "@material/material-color-utilities";
import {
  DEFAULT_SOURCE,
  SEED_PRESETS,
  WALLPAPER_FILES,
  buildScheme,
  toneToHex,
  type M3Mode,
  type M3Scheme,
} from "@/lib/m3/theme";
import { cn } from "@/lib/utils";
import { M3ButtonLink, M3Chip, M3Switch } from "@/components/m3/primitives";
import {
  CopySwap,
  StateLayer,
  Tipped,
  canRipple,
  useCopyFlash,
  useInteractiveSurface,
} from "@/components/m3/interactive";

/* ==================================================================
   THE COMPONENT STORY
   The old WebGL film is gone. The story is now told by the product
   itself: every chapter is a live, theme-reactive composition of real
   Material 3 UI components — swatches that retint the page, role rows
   that copy their hex, a Plasma desktop assembled from DOM, a terminal
   that types the real install command.

   Spine (unchanged architecture): N × 100vh track → sticky stage →
   chapter state derived from a single scroll-progress authority →
   chapter rail with aria-current jumps. React renders only on chapter
   change and theme change; scroll itself drives transforms only.
   ================================================================== */

const CHAPTER_COUNT = 7;
const EASE = [0.22, 1, 0.36, 1] as const;
const RAMP_TONES = [95, 80, 65, 50, 35, 20];

/* Counts are DERIVED from the real scheme — never hardcoded prose numbers. */
const ROLE_COUNT = Object.keys(buildScheme(DEFAULT_SOURCE, "dark").roles).length;
const PALETTE_COUNT = Object.keys(buildScheme(DEFAULT_SOURCE, "dark").palettes).length;

interface ChapterCopy {
  no: string;
  title: string;
  lead: string;
}

const COPY: ChapterCopy[] = [
  {
    no: "00",
    title: "Zyntrix",
    lead: "Material 3 for Kubuntu, generated from a single seed color.",
  },
  {
    no: "01",
    title: "One seed. One system.",
    lead: "Pick a seed — every surface on this page obeys it instantly.",
  },
  {
    no: "02",
    title: "The theme engine",
    lead: `HCT — hue, chroma, tone. Your seed becomes tonal palettes, then ${ROLE_COUNT} Material roles.`,
  },
  {
    no: "03",
    title: "The control deck",
    lead: "Tune the seed and mode live — the whole studio re-tints as you work.",
  },
  {
    no: "04",
    title: "The desktop materializes",
    lead: "A Plasma desktop assembled from the same scheme — panel, icons, windows, dock.",
  },
  {
    no: "05",
    title: "One command",
    lead: "No sudo, no PPA. One command writes every scheme, wallpaper and Konsole profile.",
  },
  {
    no: "06",
    title: "This is Zyntrix",
    lead: "The studio awaits — tune it, preview it, take it with you.",
  },
];

/* ---------------------------- section ---------------------------- */

export function StorySection({
  source,
  mode,
  scheme,
  onSourceChange,
  onModeChange,
}: {
  source: string;
  mode: M3Mode;
  /** Single source of truth — page.tsx builds (and caches) one scheme for
   *  the whole artifact; the story must not fork its own copy. */
  scheme: M3Scheme;
  onSourceChange: (hex: string) => void;
  onModeChange: (m: M3Mode) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  /* Chapter is a pure function of the one scroll authority. */
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const c = Math.min(
      CHAPTER_COUNT - 1,
      Math.max(0, Math.floor(v * CHAPTER_COUNT))
    );
    setChapter((prev) => (prev === c ? prev : c));
  });

  const jumpToChapter = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const top = track.offsetTop + (i / CHAPTER_COUNT) * track.clientHeight + 4;
    window.scrollTo({ top, behavior: "auto" });
  }, []);

  /* Ambient drift — the whole scene breathes against the scroll. */
  const driftY = useTransform(scrollYProgress, [0, 1], [36, -36]);

  return (
    <section
      ref={trackRef}
      data-testid="story-track"
      aria-label="Zyntrix story"
      style={{ height: `${CHAPTER_COUNT * 100}vh` }}
      className="relative"
    >
      <div className="sticky top-0 z-0 flex h-screen items-center overflow-hidden">
        {/* stage backdrop — theme-derived washes + grain, re-tints live */}
        <StoryBackdrop />

        {/* scene layer */}
        <motion.div
          style={{ y: driftY }}
          className="relative mx-auto w-full max-w-6xl px-5 pb-28 pt-24 sm:px-10 sm:pb-24 sm:pt-28"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={chapter}
              initial={{ opacity: 0, y: 34, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: -22,
                scale: 0.99,
                transition: { duration: 0.22, ease: EASE },
              }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              {chapter === 0 && <SceneHero source={source} scheme={scheme} />}
              {chapter === 1 && (
                <SceneSeed
                  source={source}
                  scheme={scheme}
                  onSourceChange={onSourceChange}
                />
              )}
              {chapter === 2 && <SceneRoles scheme={scheme} />}
              {chapter === 3 && (
                <SceneDeck
                  source={source}
                  mode={mode}
                  onSourceChange={onSourceChange}
                  onModeChange={onModeChange}
                />
              )}
              {chapter === 4 && <SceneDesktop />}
              {chapter === 5 && <SceneTerminal />}
              {chapter === 6 && <SceneCta />}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* chapter rail */}
        <nav
          aria-label="Story chapters"
          className="group/rail absolute right-3 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-2.5 sm:right-5 md:flex"
        >
          {COPY.map((c, i) => (
            <ChapterDot
              key={c.no}
              index={i}
              active={chapter === i}
              onJump={() => jumpToChapter(i)}
            />
          ))}
        </nav>
      </div>
    </section>
  );
}

/* ---------------------------- backdrop ---------------------------- */

function StoryBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(52rem 34rem at 10% -4%, color-mix(in srgb, var(--m3-primary) 11%, transparent), transparent 62%)," +
            "radial-gradient(46rem 30rem at 98% 18%, color-mix(in srgb, var(--m3-tertiary) 9%, transparent), transparent 58%)," +
            "radial-gradient(64rem 42rem at 50% 112%, color-mix(in srgb, var(--m3-primary) 7%, transparent), transparent 60%)",
        }}
      />
      {/* slow aurora that drifts with time, not scroll */}
      <motion.div
        className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full opacity-[0.07] blur-3xl"
        style={{
          background:
            "conic-gradient(from 120deg, var(--m3-primary), var(--m3-tertiary), var(--m3-primary))",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      />
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3\")",
        }}
      />
    </div>
  );
}

/* ------------------------ shared copy block ------------------------ */

function ChapterKicker({ no, label }: { no: string; label: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="flex items-center gap-2.5 font-mono text-xs tracking-[0.3em] text-[var(--m3-primary)]"
    >
      <span
        aria-hidden="true"
        className="inline-block h-px w-8 bg-gradient-to-r from-[var(--m3-primary)] to-transparent"
      />
      {no} · {label}
    </motion.p>
  );
}

function ChapterTitle({
  children,
  delay = 0.08,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className={cn(
        "mt-3 text-balance text-3xl font-medium leading-[1.12] tracking-tight text-[var(--m3-on-surface)] sm:text-4xl",
        className
      )}
    >
      {children}
    </motion.h2>
  );
}

function ChapterLead({
  children,
  delay = 0.16,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className={cn(
        "mt-4 max-w-md text-sm leading-relaxed text-[var(--m3-on-surface-variant)] sm:text-base",
        className
      )}
    >
      {children}
    </motion.p>
  );
}

/** Two-column scene scaffold: copy left, vignette right (stacked on mobile). */
function Scene({
  no,
  title,
  lead,
  vignette,
  wide = false,
}: {
  no: string;
  title: string;
  lead: string;
  vignette: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid items-center gap-8 lg:gap-12",
        wide ? "lg:grid-cols-[1fr_1.25fr]" : "lg:grid-cols-2"
      )}
    >
      <div>
        <ChapterKicker no={no} label={title} />
        <ChapterTitle>{title}</ChapterTitle>
        <ChapterLead>{lead}</ChapterLead>
      </div>
      <div className={cn(wide && "lg:pl-4")}>{vignette}</div>
    </div>
  );
}

/* --------------------------- 00 · hero --------------------------- */

const HERO_CHIPS = [
  { label: "Dynamic", icon: Sparkles },
  { label: "Tonal", icon: Palette },
  { label: "Plasma", icon: Settings },
];

function SceneHero({ source, scheme }: { source: string; scheme: M3Scheme }) {
  const [switchOn, setSwitchOn] = useState(true);
  const [chips, setChips] = useState<boolean[]>([true, false, true]);

  return (
    <div className="flex flex-col items-center text-center">
      <motion.span
        initial={{ opacity: 0, y: 16, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
        className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)] px-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--m3-primary)]"
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Material 3 for Kubuntu
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.08, ease: EASE }}
        className="mt-5 bg-gradient-to-r from-[var(--m3-on-surface)] via-[var(--m3-primary)] to-[var(--m3-tertiary)] bg-clip-text text-6xl font-medium leading-[1.02] tracking-tight text-transparent sm:text-8xl"
      >
        Zyntrix
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
        className="mt-5 max-w-md text-balance text-sm leading-relaxed text-[var(--m3-on-surface-variant)] sm:text-lg"
      >
        Material 3 for Kubuntu, generated from a single seed color.
      </motion.p>

      {/* the specimen card — the product, alive, in one glance */}
      <motion.div
        initial={{ opacity: 0, y: 34, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.26, ease: EASE }}
        className="relative mt-9 w-full max-w-xl"
      >
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-[2rem] blur-2xl"
          style={{
            background:
              "linear-gradient(120deg, color-mix(in srgb, var(--m3-primary) 35%, transparent), color-mix(in srgb, var(--m3-tertiary) 30%, transparent))",
          }}
          animate={{ opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="rounded-[1.75rem] border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:p-6">
          {/* live source readout */}
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] tabular-nums text-[var(--m3-on-surface-variant)]">
              LIVE SOURCE
              <motion.span
                key={source}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 480, damping: 26 }}
                className="inline-block h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                style={{ background: source, color: source }}
              />
              {source.toUpperCase()}
            </p>
            <span className="rounded-full bg-[var(--m3-primary-container)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--m3-on-primary-container)]">
              {Object.keys(scheme.roles).length} roles
            </span>
          </div>

          {/* interactive M3 controls — real, bound, theme-reactive */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
            <M3Switch
              checked={switchOn}
              onCheckedChange={setSwitchOn}
              label="Specimen switch"
            />
            {HERO_CHIPS.map((chip, i) => (
              <M3Chip
                key={chip.label}
                selected={chips[i]}
                icon={<chip.icon className="h-4 w-4" aria-hidden="true" />}
                onClick={() =>
                  setChips((prev) => prev.map((c, j) => (j === i ? !c : c)))
                }
                ariaLabel={`${chip.label} chip`}
              >
                {chip.label}
              </M3Chip>
            ))}
          </div>

          {/* tonal ramp of the live seed */}
          <div className="mt-5 flex flex-wrap items-end gap-2">
            {(["primary", "secondary", "tertiary", "neutral"] as const).map(
              (ramp) => (
                <div key={ramp} className="flex gap-1" aria-hidden="true">
                  {RAMP_TONES.map((t, i) => (
                    <motion.span
                      key={t}
                      initial={{ scaleY: 0.25, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      transition={{
                        delay: 0.45 + i * 0.05,
                        type: "spring",
                        stiffness: 300,
                        damping: 22,
                      }}
                      className="h-7 w-5 origin-bottom rounded-md sm:w-6"
                      style={{ background: toneToHex(scheme.palettes[ramp], t) }}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        aria-hidden="true"
        className="mt-8 flex flex-col items-center gap-1.5 text-[var(--m3-on-surface-variant)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <span className="font-mono text-[10px] tracking-[0.3em]">SCROLL</span>
        <motion.span
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </motion.div>
    </div>
  );
}

/* ------------------------ 01 · one seed ------------------------ */

function SceneSeed({
  source,
  scheme,
  onSourceChange,
}: {
  source: string;
  scheme: M3Scheme;
  onSourceChange: (hex: string) => void;
}) {
  const hct = useMemo(() => Hct.fromInt(argbFromHex(source.slice(1))), [source]);
  return (
    <Scene
      no={COPY[1].no}
      title={COPY[1].title}
      lead={COPY[1].lead}
      vignette={
        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.18, ease: EASE }}
          className="rounded-[1.75rem] border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.3)] sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] tabular-nums text-[var(--m3-on-surface-variant)]">
              LIVE SOURCE
              <motion.span
                key={source}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 480, damping: 26 }}
                className="inline-block h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                style={{ background: source, color: source }}
              />
              {source.toUpperCase()}
            </p>
            <span className="rounded-full bg-[var(--m3-secondary-container)] px-2.5 py-0.5 font-mono text-[10px] font-medium tabular-nums text-[var(--m3-on-secondary-container)]">
              HUE {Math.round(hct.hue)}° · C {Math.round(hct.chroma)}
            </span>
          </div>

          <div
            role="group"
            aria-label="Seed color presets"
            className="mt-4 flex flex-wrap gap-2.5"
          >
            {SEED_PRESETS.map((p, i) => (
              <SeedSwatch
                key={p.hex}
                name={p.name}
                hex={p.hex}
                selected={source === p.hex}
                index={i}
                onSelect={() => onSourceChange(p.hex)}
              />
            ))}
          </div>

          <div className="mt-5 space-y-2.5">
            {(["primary", "secondary", "tertiary", "neutral"] as const).map(
              (ramp, r) => (
                <div key={ramp} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 font-mono text-[10px] uppercase tracking-wider text-[var(--m3-on-surface-variant)]">
                    {ramp}
                  </span>
                  <div className="flex flex-1 gap-1">
                    {RAMP_TONES.map((t, i) => (
                      <motion.span
                        key={t}
                        initial={{ scaleY: 0.2, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        transition={{
                          delay: 0.3 + r * 0.08 + i * 0.04,
                          type: "spring",
                          stiffness: 320,
                          damping: 22,
                        }}
                        className="h-6 flex-1 origin-bottom rounded-md"
                        style={{ background: toneToHex(scheme.palettes[ramp], t) }}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </motion.div>
      }
    />
  );
}

function SeedSwatch({
  name,
  hex,
  selected,
  index,
  onSelect,
}: {
  name: string;
  hex: string;
  selected: boolean;
  index: number;
  onSelect: () => void;
}) {
  const { ref, surfaceProps } = useInteractiveSurface<HTMLButtonElement>({
    ripple: false,
  });
  return (
    <Tipped tip={name} side="top" gap={12}>
      <motion.button
        ref={ref}
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`Seed ${name}`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: 0.25 + index * 0.045,
          type: "spring",
          stiffness: 420,
          damping: 24,
        }}
        whileTap={{ scale: 0.88 }}
        className={cn(
          "relative h-9 w-9 overflow-hidden rounded-full transition-[scale,box-shadow] duration-200 [transition-timing-function:var(--ease-spring)] hover:scale-110",
          selected &&
            "scale-110 shadow-[0_6px_20px_color-mix(in_srgb,var(--m3-primary)_50%,transparent)] ring-2 ring-[var(--m3-on-surface)] ring-offset-2 ring-offset-[var(--m3-surface-container)]"
        )}
        {...surfaceProps}
        style={{ background: hex }}
      >
        <StateLayer />
      </motion.button>
    </Tipped>
  );
}

/* ------------------------ 02 · theme engine ------------------------ */

const ROLE_ROWS: { key: string; label: string }[] = [
  { key: "primary", label: "primary" },
  { key: "onPrimary", label: "on-primary" },
  { key: "primaryContainer", label: "primary-container" },
  { key: "secondary", label: "secondary" },
  { key: "tertiary", label: "tertiary" },
  { key: "surfaceContainer", label: "surface-container" },
  { key: "outline", label: "outline" },
  { key: "inverseSurface", label: "inverse-surface" },
];

function SceneRoles({ scheme }: { scheme: M3Scheme }) {
  const { copied, copy } = useCopyFlash("Role copied");
  const more = Object.keys(scheme.roles).length - ROLE_ROWS.length;

  return (
    <Scene
      no={COPY[2].no}
      title={COPY[2].title}
      lead={COPY[2].lead}
      vignette={
        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.18, ease: EASE }}
          className="overflow-hidden rounded-[1.75rem] border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)] shadow-[0_24px_70px_rgba(0,0,0,0.3)]"
        >
          <div className="flex items-center justify-between border-b border-[var(--m3-outline-variant)] px-5 py-3.5">
            <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--m3-on-surface-variant)]">
              MATERIAL ROLES
            </p>
            <span className="rounded-full bg-[var(--m3-tertiary-container)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--m3-on-tertiary-container)]">
              {Object.keys(scheme.roles).length} total
            </span>
          </div>
          <ul className="divide-y divide-[var(--m3-outline-variant)]">
            {ROLE_ROWS.map((row, i) => {
              const hex = scheme.roles[row.key];
              return (
                <motion.li
                  key={row.key}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.28 + i * 0.05, duration: 0.4, ease: EASE }}
                >
                  <RoleRow
                    label={row.label}
                    hex={hex}
                    copied={copied === `role-${row.key}`}
                    onCopy={() =>
                      copy(
                        `role-${row.key}`,
                        hex.toUpperCase(),
                        `${row.label} · ${hex.toUpperCase()}`
                      )
                    }
                  />
                </motion.li>
              );
            })}
          </ul>
          <div className="px-5 py-3 text-center">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--m3-on-surface-variant)]">
              + {more} MORE ROLES
            </span>
          </div>
        </motion.div>
      }
    />
  );
}

function RoleRow({
  label,
  hex,
  copied,
  onCopy,
}: {
  label: string;
  hex: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="group flex items-center gap-3 px-5 py-2.5 transition-colors duration-200 hover:bg-[var(--m3-surface-container-high)]">
      <motion.span
        aria-hidden="true"
        className="h-5 w-5 shrink-0 rounded-md border border-black/10 shadow-inner transition-[scale] duration-300 [transition-timing-function:var(--ease-spring)] group-hover:scale-125"
        style={{ background: hex }}
      />
      <span className="min-w-0 flex-1 truncate text-sm text-[var(--m3-on-surface)]">
        {label}
      </span>
      <span className="font-mono text-xs tabular-nums text-[var(--m3-on-surface-variant)] transition-colors group-hover:text-[var(--m3-on-surface)]">
        {hex.toUpperCase()}
      </span>
      <button
        type="button"
        onClick={onCopy}
        aria-label={`Copy ${label} ${hex}`}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[var(--m3-on-surface-variant)] transition-[background-color,color,scale] duration-200 [transition-timing-function:var(--ease-spring)] hover:bg-[var(--m3-secondary-container)] hover:text-[var(--m3-on-secondary-container)] active:scale-90 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2"
      >
        <CopySwap done={copied} size="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ------------------------ 03 · control deck ------------------------ */

function SceneDeck({
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
  return (
    <Scene
      no={COPY[3].no}
      title={COPY[3].title}
      lead={COPY[3].lead}
      vignette={
        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.18, ease: EASE }}
          className="rounded-[1.75rem] border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.3)] sm:p-6"
        >
          <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] tabular-nums text-[var(--m3-on-surface-variant)]">
            LIVE SOURCE
            <motion.span
              key={source}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 480, damping: 26 }}
              className="inline-block h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]"
              style={{ background: source, color: source }}
            />
            {source.toUpperCase()}
          </p>
          <div
            role="group"
            aria-label="Seed color presets"
            className="mt-4 flex flex-wrap gap-2.5"
          >
            {SEED_PRESETS.map((p, i) => (
              <SeedSwatch
                key={p.hex}
                name={p.name}
                hex={p.hex}
                selected={source === p.hex}
                index={i}
                onSelect={() => onSourceChange(p.hex)}
              />
            ))}
          </div>
          <div className="mt-5 border-t border-[var(--m3-outline-variant)] pt-5">
            <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--m3-on-surface-variant)]">
              MODE
            </p>
            <div
              role="group"
              aria-label="Theme mode"
              className="relative mt-3 inline-flex rounded-full border border-[var(--m3-outline-variant)] p-0.5"
            >
              {(["dark", "light"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onModeChange(m)}
                  aria-pressed={mode === m}
                  className={cn(
                    "relative rounded-full px-5 py-2 text-xs font-medium capitalize transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2",
                    mode === m
                      ? "text-[var(--m3-on-primary)]"
                      : "text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-on-surface)]"
                  )}
                >
                  {mode === m && (
                    <motion.span
                      layoutId="story-mode-thumb"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-[var(--m3-primary)]"
                      transition={{ type: "spring", stiffness: 460, damping: 38 }}
                    />
                  )}
                  <span className="relative z-10">{m}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      }
    />
  );
}

/* ------------------------ 04 · the desktop ------------------------ */

const DESKTOP_ICONS = [
  { icon: Folder, label: "Home" },
  { icon: SquareTerminal, label: "Konsole" },
];

const DOCK_APPS = [
  { icon: Folder, label: "Files" },
  { icon: SquareTerminal, label: "Konsole" },
  { icon: Palette, label: "Zyntrix" },
  { icon: Settings, label: "Settings" },
  { icon: Music, label: "Media" },
];

function SceneDesktop() {
  /* Client-only mount (chapter scenes render after scroll) — a lazy Date init
     is hydration-safe here and avoids a synchronous setState in the effect. */
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <Scene
      wide
      no={COPY[4].no}
      title={COPY[4].title}
      lead={COPY[4].lead}
      vignette={
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 9 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className="[perspective:1400px]"
        >
          <div
            data-testid="story-mini-desktop"
            className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[var(--m3-outline-variant)] shadow-[0_36px_90px_rgba(0,0,0,0.4)]"
          >
            {/* wallpaper — painted from the live scheme */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 95% at 18% 8%, color-mix(in srgb, var(--m3-primary-container) 85%, transparent), transparent 62%)," +
                  "radial-gradient(105% 85% at 86% 26%, color-mix(in srgb, var(--m3-tertiary-container) 75%, transparent), transparent 58%)," +
                  "linear-gradient(158deg, var(--m3-surface-container-lowest), var(--m3-surface-container))",
              }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute -right-10 top-6 h-44 w-44 rounded-full opacity-30 blur-2xl"
              style={{ background: "var(--m3-primary)" }}
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* top panel */}
            <motion.div
              initial={{ y: -26, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 260, damping: 26 }}
              className="absolute inset-x-0 top-0 z-10 flex h-7 items-center gap-2 border-b border-[var(--m3-outline-variant)]/60 bg-[color-mix(in_srgb,var(--m3-surface-container)_88%,transparent)] px-2.5 text-[10px] text-[var(--m3-on-surface)] backdrop-blur-sm"
            >
              <span className="rounded-full bg-[var(--m3-secondary-container)] px-2 py-0.5 font-medium text-[var(--m3-on-secondary-container)]">
                Activities
              </span>
              <span className="absolute left-1/2 -translate-x-1/2 font-medium tabular-nums">
                {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="ml-auto flex items-center gap-1.5 text-[var(--m3-on-surface-variant)]">
                <Wifi className="h-3 w-3" aria-hidden="true" />
                <Volume2 className="h-3 w-3" aria-hidden="true" />
                <BatteryMedium className="h-3 w-3" aria-hidden="true" />
              </span>
            </motion.div>

            {/* desktop icons */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 24 }}
              className="absolute left-3 top-11 z-10 flex flex-col gap-2"
            >
              {DESKTOP_ICONS.map((app) => (
                <div
                  key={app.label}
                  className="group flex w-14 cursor-default flex-col items-center gap-1 rounded-lg p-1.5 transition-colors hover:bg-black/10"
                >
                  <app.icon
                    className="h-5 w-5 text-[var(--m3-primary)] drop-shadow"
                    aria-hidden="true"
                  />
                  <span className="text-[8px] font-medium leading-none text-[var(--m3-on-surface)]">
                    {app.label}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* konsole window */}
            <motion.div
              initial={{ y: 26, opacity: 0, scale: 0.94 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.65, type: "spring", stiffness: 280, damping: 24 }}
              className="absolute bottom-12 left-1/2 z-10 w-[62%] max-w-[300px] -translate-x-1/2 overflow-hidden rounded-lg border border-[var(--m3-outline-variant)] bg-[color-mix(in_srgb,var(--m3-surface-container-lowest)_92%,transparent)] shadow-xl backdrop-blur-sm"
            >
              <div className="flex items-center gap-1.5 border-b border-[var(--m3-outline-variant)]/70 bg-[var(--m3-surface-container)] px-2.5 py-1.5">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--m3-error)]/80" />
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--m3-warning)]/80" />
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--m3-success)]/80" />
                <span className="ml-1.5 text-[9px] font-medium text-[var(--m3-on-surface-variant)]">
                  Konsole — zyntrix
                </span>
              </div>
              <div className="space-y-0.5 p-2.5 font-mono text-[9px] leading-relaxed sm:text-[10px]">
                <p className="text-[var(--m3-on-surface)]">
                  <span className="text-[var(--m3-primary)]">$</span> zyntrix apply
                </p>
                <p className="text-[var(--m3-on-surface-variant)]">
                  → writing {ROLE_COUNT} color roles
                </p>
                <p className="flex items-center gap-1 text-[var(--m3-success)]">
                  <Check className="h-2.5 w-2.5" aria-hidden="true" /> scheme live
                </p>
                <p className="text-[var(--m3-on-surface)]">
                  <span className="text-[var(--m3-primary)]">$</span>
                  <motion.span
                    aria-hidden="true"
                    className="ml-1 inline-block h-[9px] w-[5px] translate-y-[1px] bg-[var(--m3-primary)]"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                  />
                </p>
              </div>
            </motion.div>

            {/* dock */}
            <motion.div
              initial={{ y: 34, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 260, damping: 22 }}
              className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-[var(--m3-outline-variant)]/70 bg-[color-mix(in_srgb,var(--m3-surface-container-high)_88%,transparent)] px-2.5 py-2 shadow-lg backdrop-blur-md"
            >
              {DOCK_APPS.map((app) => (
                <Tipped key={app.label} tip={app.label} side="top" gap={8}>
                  <span className="grid h-8 w-8 cursor-default place-items-center rounded-xl bg-[var(--m3-surface-container-lowest)] text-[var(--m3-primary)] shadow-sm transition-[scale,background-color] duration-200 [transition-timing-function:var(--ease-spring)] hover:scale-110 hover:bg-[var(--m3-primary-container)]">
                    <app.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Tipped>
              ))}
            </motion.div>
          </div>
        </motion.div>
      }
    />
  );
}

/* ------------------------ 05 · one command ------------------------ */

const TERMINAL_LINES: { text: string; kind: "cmd" | "muted" | "ok" }[] = [
  { text: "$ zyntrix install", kind: "cmd" },
  { text: `→ writing ${ROLE_COUNT} color roles`, kind: "muted" },
  { text: `→ ${WALLPAPER_FILES.length} wallpapers · 2 konsole schemes`, kind: "muted" },
  { text: "✓ done — log out to apply", kind: "ok" },
];

function SceneTerminal() {
  const totalChars = useMemo(
    () => TERMINAL_LINES.reduce((n, l) => n + l.text.length, 0),
    []
  );
  /* Reduced motion (or no-ripple contexts) reads the full output instantly —
     no state write needed in the effect. */
  const [typed, setTyped] = useState(() => (canRipple() ? 0 : Number.POSITIVE_INFINITY));
  const { copied, copy } = useCopyFlash("Command copied");

  useEffect(() => {
    if (!canRipple()) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(i);
      if (i >= totalChars) clearInterval(id);
    }, 26);
    return () => clearInterval(id);
  }, [totalChars]);

  /* Cumulative line offsets — computed immutably. */
  const starts = useMemo(
    () =>
      TERMINAL_LINES.map((_, i) =>
        TERMINAL_LINES.slice(0, i).reduce((n, l) => n + l.text.length, 0)
      ),
    []
  );
  const rendered = TERMINAL_LINES.map((line, i) => {
    const visible = Math.max(0, Math.min(line.text.length, typed - starts[i]));
    return { ...line, visible };
  });
  const done = typed >= totalChars;

  return (
    <Scene
      no={COPY[5].no}
      title={COPY[5].title}
      lead={COPY[5].lead}
      vignette={
        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.18, ease: EASE }}
          className="overflow-hidden rounded-[1.75rem] border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-lowest)] shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
        >
          <div className="flex items-center gap-2 border-b border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)] px-4 py-3">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[var(--m3-error)]/80" />
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[var(--m3-warning)]/80" />
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[var(--m3-success)]/80" />
            <span className="ml-2 font-mono text-[11px] text-[var(--m3-on-surface-variant)]">
              zyntrix — bash
            </span>
            <button
              type="button"
              onClick={() => copy("install", "zyntrix install", "zyntrix install")}
              aria-label="Copy install command"
              className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-[var(--m3-on-surface-variant)] transition-[background-color,color,scale] duration-200 [transition-timing-function:var(--ease-spring)] hover:bg-[var(--m3-secondary-container)] hover:text-[var(--m3-on-secondary-container)] active:scale-95 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2"
            >
              <CopySwap done={copied === "install"} size="h-3.5 w-3.5" />
              {copied === "install" ? "Copied" : "Copy"}
            </button>
          </div>
          <div
            className="min-h-[9.5rem] space-y-1.5 p-5 font-mono text-xs leading-relaxed sm:text-[13px]"
            aria-live="polite"
          >
            {rendered.map((line, i) => (
              <p
                key={i}
                className={cn(
                  "whitespace-pre-wrap break-words",
                  line.kind === "cmd" && "text-[var(--m3-on-surface)]",
                  line.kind === "muted" && "text-[var(--m3-on-surface-variant)]",
                  line.kind === "ok" && "text-[var(--m3-success)]"
                )}
              >
                {line.text.slice(0, line.visible)}
                {line.kind === "cmd" && line.visible < line.text.length && (
                  <motion.span
                    aria-hidden="true"
                    className="ml-0.5 inline-block h-3.5 w-[7px] translate-y-[2px] bg-[var(--m3-primary)]"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </p>
            ))}
            <AnimatePresence>
              {done && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                  className="flex items-center gap-2 pt-1 text-[var(--m3-on-surface)]"
                >
                  <motion.span
                    initial={{ scale: 0, rotate: -40 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 480, damping: 22 }}
                    className="grid h-4 w-4 place-items-center rounded-full bg-[var(--m3-success)] text-[var(--m3-surface)]"
                  >
                    <Check className="h-2.5 w-2.5" strokeWidth={3.5} aria-hidden="true" />
                  </motion.span>
                  {ROLE_COUNT} roles · {PALETTE_COUNT} palettes · ready
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      }
    />
  );
}

/* --------------------------- 06 · cta --------------------------- */

const CTA_STATS = [
  `${ROLE_COUNT} roles`,
  `${PALETTE_COUNT} palettes`,
  `${WALLPAPER_FILES.length} wallpapers`,
  "1 command",
];

function SceneCta() {
  return (
    <div className="flex flex-col items-center text-center">
      <ChapterKicker no={COPY[6].no} label="finale" />
      <ChapterTitle>This is Zyntrix</ChapterTitle>
      <ChapterLead className="mx-auto text-center">
        The studio awaits — tune it, preview it, take it with you.
      </ChapterLead>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.55, ease: EASE }}
        className="mt-7 flex flex-wrap items-center justify-center gap-2"
      >
        {CTA_STATS.map((s, i) => (
          <motion.span
            key={s}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.07, type: "spring", stiffness: 380, damping: 22 }}
            className="rounded-full border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)] px-3.5 py-1.5 font-mono text-xs tabular-nums text-[var(--m3-on-surface)]"
          >
            {s}
          </motion.span>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.55, ease: EASE }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        <M3ButtonLink href="#customize" size="lg">
          Enter the studio
          <ArrowDown
            className="h-5 w-5 transition-transform duration-300 [transition-timing-function:var(--ease-spring)] group-hover:translate-y-0.5"
            aria-hidden="true"
          />
        </M3ButtonLink>
        <M3ButtonLink href="#download" variant="outlined" size="lg">
          Get the theme
        </M3ButtonLink>
      </motion.div>
    </div>
  );
}

/* --------------------------- rail --------------------------- */

function ChapterDot({
  index,
  active,
  onJump,
}: {
  index: number;
  active: boolean;
  onJump: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onJump}
      aria-current={active ? "true" : undefined}
      aria-label={`Jump to chapter ${COPY[index].no}: ${COPY[index].title}`}
      className="group flex items-center gap-2.5 outline-offset-4 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)]"
    >
      <span
        className={cn(
          "font-mono text-[10px] tracking-widest transition-all duration-300",
          active
            ? "text-[var(--m3-on-surface)] opacity-100"
            : "text-[var(--m3-on-surface-variant)] opacity-0 group-hover/rail:opacity-100"
        )}
      >
        {COPY[index].no}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "h-[3px] rounded-full transition-all duration-500 [transition-timing-function:var(--ease-enter)]",
          active
            ? "w-8 bg-[var(--m3-primary)] shadow-[0_0_10px_color-mix(in_srgb,var(--m3-primary)_80%,transparent)]"
            : "w-3 bg-[var(--m3-outline)] group-hover:bg-[var(--m3-on-surface-variant)]"
        )}
      />
    </button>
  );
}
