"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  Bookmark,
  Home,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ThumbsUp,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { M3Button, M3Chip, M3Fab, M3RadioPair, M3Switch, Reveal, SectionHeader } from "./primitives";
import { StateLayer, useInteractiveSurface } from "./interactive";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: Home, label: "Home" },
  { icon: Bookmark, label: "Saved" },
  { icon: ThumbsUp, label: "Liked" },
  { icon: Settings, label: "Settings" },
];

export function ComponentGallery() {
  const [sw, setSw] = useState(true);
  const [chip, setChip] = useState(true);
  const [chip2, setChip2] = useState(false);

  return (
    <section id="components" className="px-4 py-14 sm:py-20" aria-labelledby="components-title">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          id="components-title"
          eyebrow="Design language"
          title={<>Components your desktop will speak</>}
        >
          The same design language your apps will speak once the theme is
          applied — buttons, chips, fields and cards straight from the M3
          specification. Every control below is live: touch it.
        </SectionHeader>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Buttons */}
          <Reveal delay={0} className="h-full">
            <GalleryCard title="Buttons">
              <div className="flex flex-wrap items-center gap-3">
                <M3Button variant="filled">Filled</M3Button>
                <M3Button variant="tonal">Tonal</M3Button>
                <M3Button variant="outlined">Outlined</M3Button>
                <M3Button variant="text">Text</M3Button>
                <M3Button variant="filled" disabled>
                  Disabled
                </M3Button>
              </div>
            </GalleryCard>
          </Reveal>

          {/* FABs */}
          <Reveal delay={0.05} className="h-full">
            <GalleryCard title="Floating action buttons">
              <div className="flex flex-wrap items-center gap-4">
                <M3Fab size="sm" label="Edit">
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </M3Fab>
                <M3Fab label="Create">
                  <Plus className="h-6 w-6" aria-hidden="true" />
                </M3Fab>
                <M3Fab extended label="Compose">
                  <Plus className="h-5 w-5" aria-hidden="true" />
                  Compose
                </M3Fab>
              </div>
            </GalleryCard>
          </Reveal>

          {/* Chips */}
          <Reveal delay={0.1} className="h-full">
            <GalleryCard title="Chips">
              <div className="flex flex-wrap gap-2">
                <M3Chip icon={<Search className="h-4 w-4" aria-hidden="true" />}>
                  Assist
                </M3Chip>
                <M3Chip selected={chip} onClick={() => setChip(!chip)}>
                  Filter · KDE
                </M3Chip>
                <M3Chip selected={chip2} onClick={() => setChip2(!chip2)}>
                  Filter · GTK
                </M3Chip>
              </div>
            </GalleryCard>
          </Reveal>

          {/* Switch + radio + progress */}
          <Reveal delay={0.15} className="h-full">
            <GalleryCard title="Selection controls">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[var(--m3-on-surface)]">
                    Color from wallpaper
                  </span>
                  <M3Switch checked={sw} onCheckedChange={setSw} label="Color from wallpaper" />
                </div>
                <RadioDemo />
                <ProgressDemo />
              </div>
            </GalleryCard>
          </Reveal>

          {/* Text field */}
          <Reveal delay={0.2} className="h-full">
            <GalleryCard title="Text field (filled)">
              <TextFieldDemo />
            </GalleryCard>
          </Reveal>

          {/* Cards */}
          <Reveal delay={0.25} className="h-full">
            <GalleryCard title="Cards">
              <div className="grid gap-2.5 sm:grid-cols-3">
                <div className="m3-card rounded-2xl bg-[var(--m3-surface-container-low)] p-3 shadow-md transition-transform duration-300 [transition-timing-function:var(--ease-enter)] hover:-translate-y-0.5">
                  <p className="text-xs font-medium text-[var(--m3-on-surface)]">Elevated</p>
                  <p className="mt-0.5 text-[11px] text-[var(--m3-on-surface-variant)]">shadow · tonal</p>
                </div>
                <div className="m3-card rounded-2xl bg-[var(--m3-surface-container-highest)] p-3 transition-transform duration-300 [transition-timing-function:var(--ease-enter)] hover:-translate-y-0.5">
                  <p className="text-xs font-medium text-[var(--m3-on-surface)]">Filled</p>
                  <p className="mt-0.5 text-[11px] text-[var(--m3-on-surface-variant)]">no shadow</p>
                </div>
                <div className="m3-card rounded-2xl border border-[var(--m3-outline)] p-3 transition-transform duration-300 [transition-timing-function:var(--ease-enter)] hover:-translate-y-0.5">
                  <p className="text-xs font-medium text-[var(--m3-on-surface)]">Outlined</p>
                  <p className="mt-0.5 text-[11px] text-[var(--m3-on-surface-variant)]">1dp border</p>
                </div>
              </div>
            </GalleryCard>
          </Reveal>

          {/* Navigation bar */}
          <Reveal delay={0.3} className="h-full">
            <GalleryCard title="Navigation bar">
              <NavBarDemo />
            </GalleryCard>
          </Reveal>

          {/* Snackbar */}
          <Reveal delay={0.35} className="h-full">
            <GalleryCard title="Snackbar">
              <SnackbarDemo />
            </GalleryCard>
          </Reveal>

          {/* Badges */}
          <Reveal delay={0.4} className="h-full">
            <GalleryCard title="Badges">
              <div className="flex items-center gap-5">
                <span className="group relative inline-flex">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)] transition-transform duration-300 [transition-timing-function:var(--ease-spring)] group-hover:scale-105">
                    <Pencil className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 520, damping: 20, delay: 0.25 }}
                    className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--m3-error)] px-1 text-[9px] font-medium text-[var(--m3-on-error)]"
                  >
                    3
                  </motion.span>
                </span>
                <span
                  className="h-2.5 w-2.5 rounded-full bg-[var(--m3-error)] anim-glow-pulse"
                  role="img"
                  aria-label="Small notification badge"
                />
                <span className="rounded-lg bg-[var(--m3-tertiary-container)] px-2.5 py-1 text-xs font-medium text-[var(--m3-on-tertiary-container)]">
                  Plasma 6 ready
                </span>
              </div>
            </GalleryCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ live demos ------------------------------ */

function RadioDemo() {
  const [value, setValue] = useState("Dynamic");
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-[var(--m3-on-surface-variant)]">Color source</span>
      <M3RadioPair
        options={["Dynamic", "Static"]}
        value={value}
        onValueChange={setValue}
        label="Color source demo"
      />
    </div>
  );
}

function ProgressDemo() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <div
      ref={ref}
      className="relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--m3-surface-container-highest)]"
      role="progressbar"
      aria-valuenow={60}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Demo progress"
    >
      <motion.div
        className="relative h-full overflow-hidden rounded-full bg-[var(--m3-primary)]"
        initial={{ width: "0%" }}
        animate={inView ? { width: "60%" } : { width: "0%" }}
        transition={{ duration: 1.15, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <span
          aria-hidden="true"
          className="anim-progress-sheen absolute inset-0 rounded-full bg-[linear-gradient(100deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:220%_100%]"
        />
      </motion.div>
    </div>
  );
}

/** M3 filled text field: floating label, active indicator, clear + counter */
function TextFieldDemo() {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  const MAX = 24;
  return (
    <div className="group relative rounded-t-xl border-b-2 border-[var(--m3-on-surface-variant)] bg-[var(--m3-surface-container-highest)] transition-[border-color,background-color] duration-200 focus-within:border-[var(--m3-primary)] hover:bg-[var(--m3-surface-container-highest)]/70">
      {/* active indicator — M3's signature bottom bar draw */}
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-[var(--m3-primary)] transition-transform duration-300 [transition-timing-function:var(--ease-enter)] group-focus-within:scale-x-100"
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-4 origin-left transition-all duration-200 [transition-timing-function:var(--ease-enter)]",
          active
            ? "top-[0.4rem] scale-[0.78] text-xs font-medium text-[var(--m3-primary)]"
            : "top-1/2 -translate-y-1/2 text-sm text-[var(--m3-on-surface-variant)]"
        )}
      >
        Wallpaper search
      </span>
      <input
        className="w-full bg-transparent pb-2 pt-6 text-sm text-[var(--m3-on-surface)] outline-none"
        value={value}
        maxLength={MAX}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label="Wallpaper search demo"
      />
      <AnimatePresence>
        {value && (
          <motion.button
            key="clear"
            type="button"
            onClick={() => setValue("")}
            onMouseDown={(e) => e.preventDefault()}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-[var(--m3-on-surface-variant)] transition-[background-color,scale] duration-150 hover:bg-[var(--m3-surface-container)] active:scale-90 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)]"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 560, damping: 30 }}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>
      <span
        aria-hidden="true"
        className={cn(
          "absolute bottom-1 right-3 font-mono text-[10px] tabular-nums text-[var(--m3-on-surface-variant)] transition-opacity duration-200",
          focused ? "opacity-70" : "opacity-0"
        )}
      >
        {value.length}/{MAX}
      </span>
    </div>
  );
}

function NavBarDemo() {
  const [active, setActive] = useState(0);
  return (
    <nav
      className="flex items-center justify-around rounded-3xl bg-[var(--m3-surface-container)] px-2 py-2"
      aria-label="Navigation bar demo"
    >
      {NAV_ITEMS.map(({ icon: Icon, label }, i) => (
        <NavBarItem
          key={label}
          icon={Icon}
          label={label}
          active={active === i}
          onSelect={() => setActive(i)}
        />
      ))}
    </nav>
  );
}

function NavBarItem({
  icon: Icon,
  label,
  active,
  onSelect,
}: {
  icon: typeof Home;
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  const { ref, surfaceProps } = useInteractiveSurface<HTMLButtonElement>({
    ripple: false,
    bloomRadius: 56,
  });
  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`${label} tab (demo)`}
      className="group flex flex-col items-center gap-0.5 rounded-2xl p-1 transition-[scale] duration-200 [transition-timing-function:var(--ease-spring)] active:scale-90 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2"
      {...surfaceProps}
    >
      <span
        className={cn(
          "relative flex h-8 w-14 items-center justify-center overflow-hidden rounded-full transition-[background-color] duration-300",
          active && "bg-[var(--m3-secondary-container)]"
        )}
      >
        {active && (
          <motion.span
            layoutId="gallery-nav-pill"
            className="absolute inset-0 rounded-full bg-[var(--m3-secondary-container)]"
            transition={{ type: "spring", stiffness: 480, damping: 38 }}
            aria-hidden="true"
          />
        )}
        <StateLayer />
        <Icon
          className={cn(
            "relative z-10 h-[18px] w-[18px] transition-[color,transform] duration-300 [transition-timing-function:var(--ease-spring)]",
            active
              ? "text-[var(--m3-on-secondary-container)]"
              : "text-[var(--m3-on-surface-variant)] group-hover:scale-110 group-hover:text-[var(--m3-on-surface)]"
          )}
          aria-hidden="true"
        />
      </span>
      <span
        className={cn(
          "text-[10px] font-medium transition-colors duration-200",
          active
            ? "text-[var(--m3-on-surface)]"
            : "text-[var(--m3-on-surface-variant)]"
        )}
      >
        {label}
      </span>
    </button>
  );
}

function SnackbarDemo() {
  const [visible, setVisible] = useState(true);
  const { toast } = useToast();
  return (
    <div className="flex min-h-[3.25rem] flex-col items-start justify-center">
      <AnimatePresence mode="wait" initial={false}>
        {visible ? (
          <motion.div
            key="snack"
            role="status"
            className="flex w-full items-center gap-3 rounded-xl bg-[var(--m3-inverse-surface)] px-4 py-3.5 text-[var(--m3-inverse-on-surface)] shadow-lg"
            initial={{ y: 26, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-sm">Theme applied</p>
            <button
              type="button"
              onClick={() => {
                setVisible(false);
                toast({ title: "Theme change reverted", description: "Snackbar action demo" });
              }}
              className="group/snack relative ml-auto overflow-hidden rounded-full px-2.5 py-1 text-sm font-medium uppercase tracking-wide text-[var(--m3-inverse-primary)] transition-[background-color,scale] duration-150 [transition-timing-function:var(--ease-enter)] hover:bg-white/10 active:scale-95 focus-visible:outline-2 focus-visible:outline-[var(--m3-inverse-primary)]"
            >
              <StateLayer />
              <span className="relative z-10">Undo</span>
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="replay"
            type="button"
            onClick={() => setVisible(true)}
            className="m3-btn m3-btn-text h-9"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Show snackbar
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function GalleryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="m3-card h-full rounded-[28px] border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-low)] p-6">
      <h3 className="mb-5 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-[var(--m3-primary)]">
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 rounded-full transition-transform duration-500 [transition-timing-function:var(--ease-spring)] hover:scale-150"
          style={{ background: "linear-gradient(135deg, var(--m3-primary), var(--m3-tertiary))" }}
        />
        {title}
      </h3>
      {children}
    </div>
  );
}
