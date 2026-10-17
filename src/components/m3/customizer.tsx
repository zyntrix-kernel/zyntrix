"use client";

import { motion, type Variants } from "framer-motion";
import { Check, Moon, Pipette, Sun } from "lucide-react";
import { SEED_PRESETS, type M3Mode } from "@/lib/m3/theme";
import { cn } from "@/lib/utils";
import {
  CopySwap,
  StateLayer,
  Tipped,
  useCopyFlash,
  useInteractiveSurface,
} from "./interactive";
import { Reveal, SectionHeader } from "./primitives";

const swatchContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } },
};
const swatchItem: Variants = {
  hidden: { opacity: 0, scale: 0.6, y: 10 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 420, damping: 26 },
  },
};

export function Customizer({
  source,
  onSourceChange,
  mode,
  onModeChange,
  roles,
}: {
  source: string;
  onSourceChange: (hex: string) => void;
  mode: M3Mode;
  onModeChange: (mode: M3Mode) => void;
  roles: Record<string, string>;
}) {
  return (
    <section id="customize" className="px-4 py-14 sm:py-20" aria-labelledby="customize-title">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Dynamic color"
          id="customize-title"
          title="Theme customizer"
        >
          Choose a seed color. Everything on this page — including the live
          Plasma preview and every generated file — re-tints instantly using
          the same Material color engine that powers Android &amp; ChromeOS.
        </SectionHeader>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto]">
          <Reveal>
          <div className="h-full rounded-[28px] bg-[var(--m3-surface-container-low)] p-6 sm:p-8">
            <p className="text-sm font-medium uppercase tracking-wider text-[var(--m3-primary)]">
              Seed presets
            </p>
            <motion.div
              variants={swatchContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              role="group"
              aria-label="Seed color presets"
              className="mt-4 flex flex-wrap gap-3"
            >
              {SEED_PRESETS.map((preset) => (
                <SeedSwatch
                  key={preset.hex}
                  preset={preset}
                  selected={source === preset.hex}
                  onSelect={() => onSourceChange(preset.hex)}
                />
              ))}
            </motion.div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <CustomSeedField source={source} onSourceChange={onSourceChange} />

              <div
                role="group"
                aria-label="Color scheme mode"
                className="relative flex h-12 rounded-full border border-[var(--m3-outline)] p-1"
              >
                {(["light", "dark"] as M3Mode[]).map((m) => {
                  const active = mode === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onModeChange(m)}
                      className={cn(
                        "relative h-full rounded-full px-5 text-sm font-medium capitalize transition-[color,scale] duration-200 [transition-timing-function:var(--ease-enter)] active:scale-95 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2",
                        active
                          ? "text-[var(--m3-on-primary)]"
                          : "text-[var(--m3-on-surface-variant)] hover:bg-[var(--m3-surface-container-highest)]"
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="mode-thumb"
                          className="absolute inset-0 rounded-full bg-[var(--m3-primary)]"
                          transition={{ type: "spring", stiffness: 480, damping: 40 }}
                          aria-hidden="true"
                        />
                      )}
                      <span className="relative z-10 inline-flex items-center gap-1.5">
                        {m === "light" ? (
                          <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {m}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          </Reveal>

          <Reveal delay={0.08}>
          <div className="flex h-full flex-col justify-between gap-4 rounded-[28px] bg-[var(--m3-primary-container)] p-6 text-[var(--m3-on-primary-container)] sm:p-8 lg:w-72">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider opacity-80">
                Key roles
              </p>
              <KeyRoles roles={roles} />
            </div>
            <p className="text-xs leading-relaxed opacity-80">
              Tones are computed in HCT color space for perceptually accurate
              contrast — the heart of Material You.
            </p>
          </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- seed swatch --------------------------- */

function SeedSwatch({
  preset,
  selected,
  onSelect,
}: {
  preset: { name: string; hex: string };
  selected: boolean;
  onSelect: () => void;
}) {
  const { ref, surfaceProps } = useInteractiveSurface<HTMLButtonElement>({
    bloomRadius: 70,
  });
  return (
    <motion.button
      ref={ref}
      variants={swatchItem}
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Use ${preset.name} seed color`}
      className={cn(
        "group relative flex flex-col items-center gap-2 rounded-2xl p-2 transition-[scale,background-color] duration-200 [transition-timing-function:var(--ease-enter)] hover:scale-[1.05] active:scale-95 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2",
        selected ? "bg-[var(--m3-secondary-container)]" : "hover:bg-[var(--m3-surface-container)]"
      )}
      {...surfaceProps}
    >
      <Tipped tip={preset.name} side="top" gap={12}>
        <span
          className="relative block h-14 w-14 overflow-hidden rounded-full shadow-md transition-shadow duration-300 [transition-timing-function:var(--ease-enter)] group-hover:shadow-[0_6px_26px_var(--swatch-glow)]"
          style={{
            background: preset.hex,
            ["--swatch-glow" as string]: `color-mix(in srgb, ${preset.hex} 55%, transparent)`,
          }}
        >
          <StateLayer />
          {selected && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 520, damping: 26, delay: 0.03 }}
              className="absolute inset-0 z-10 grid place-items-center"
              aria-hidden="true"
            >
              <Check className="h-5 w-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]" strokeWidth={3} />
            </motion.span>
          )}
        </span>
      </Tipped>
      <span
        className={cn(
          "text-xs font-medium transition-colors duration-200",
          selected
            ? "text-[var(--m3-on-secondary-container)]"
            : "text-[var(--m3-on-surface-variant)] group-hover:text-[var(--m3-on-surface)]"
        )}
      >
        {preset.name}
      </span>
      {selected && (
        <motion.span
          layoutId="seed-ring"
          className="pointer-events-none absolute -inset-[5px] rounded-full ring-2 ring-[var(--m3-on-surface)]"
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          aria-hidden="true"
        />
      )}
    </motion.button>
  );
}

/* -------------------------- custom seed field -------------------------- */

function CustomSeedField({
  source,
  onSourceChange,
}: {
  source: string;
  onSourceChange: (hex: string) => void;
}) {
  const { copied, copy } = useCopyFlash();
  return (
    <label
      className="group flex items-center gap-4 rounded-full bg-[var(--m3-surface-container-highest)] py-2 pl-2 pr-5 transition-[background-color,box-shadow] focus-within:ring-2 focus-within:ring-[var(--m3-primary)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--m3-surface-container-low)] hover:shadow-[0_2px_14px_color-mix(in_srgb,var(--m3-primary)_18%,transparent)]"
    >
      <input
        type="color"
        value={source}
        onChange={(e) => onSourceChange(e.target.value)}
        className="m3-color-input h-10 w-10"
        aria-label="Pick a custom seed color"
      />
      <span className="flex flex-col">
        <span className="text-xs text-[var(--m3-on-surface-variant)]">
          Custom seed
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            copy("custom-seed", source.toUpperCase());
          }}
          aria-label={`Copy seed value ${source.toUpperCase()}`}
          className="group/copy -mx-1 flex items-center gap-1.5 rounded-full px-1 py-0.5 font-mono text-sm font-medium text-[var(--m3-on-surface)] transition-colors hover:text-[var(--m3-primary)] focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)]"
        >
          {source.toUpperCase()}
          <CopySwap
            done={copied === "custom-seed"}
            size="h-3 w-3"
            className="opacity-50 transition-opacity group-hover/copy:opacity-100"
          />
        </button>
      </span>
      <Pipette
        className="ml-auto h-4 w-4 text-[var(--m3-on-surface-variant)] transition-transform duration-300 [transition-timing-function:var(--ease-spring)] group-hover:-rotate-12 group-hover:text-[var(--m3-primary)]"
        aria-hidden="true"
      />
    </label>
  );
}

/* ----------------------------- key roles ----------------------------- */

function KeyRoles({ roles }: { roles: Record<string, string> }) {
  const { copied, copy } = useCopyFlash();
  return (
    <div className="mt-4 space-y-1 font-mono text-sm">
      {[
        ["Primary", "primary"],
        ["Secondary", "secondary"],
        ["Tertiary", "tertiary"],
        ["Error", "error"],
        ["Surface", "surface"],
      ].map(([label, role]) => {
        const hex = roles[role]?.toUpperCase() ?? "";
        const done = copied === role;
        return (
          <button
            key={role}
            type="button"
            onClick={() => copy(role, hex, `${label} · ${hex}`)}
            aria-label={`Copy ${label} value ${hex}`}
            className="group/role -mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-[background-color,scale] duration-200 [transition-timing-function:var(--ease-enter)] hover:bg-black/5 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-[var(--m3-on-primary-container)]"
          >
            <span className="relative h-6 w-6 shrink-0">
              <motion.span
                className="block h-6 w-6 rounded-full border border-black/10 shadow-sm transition-transform duration-300 [transition-timing-function:var(--ease-spring)] group-hover/role:scale-110"
                style={{ background: `var(--m3-${role})` }}
                aria-hidden="true"
              />
              {done && (
                <motion.span
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 grid place-items-center"
                  aria-hidden="true"
                >
                  <Check className="h-3.5 w-3.5 text-[var(--m3-on-primary-container)] drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" strokeWidth={3.5} />
                </motion.span>
              )}
            </span>
            <span className="capitalize">{label}</span>
            <span
              className={cn(
                "ml-auto font-mono text-xs transition-all duration-200",
                done
                  ? "translate-x-0 opacity-100"
                  : "opacity-70 group-hover/role:translate-x-[-2px] group-hover/role:opacity-100"
              )}
            >
              {hex}
            </span>
            <CopySwap
              done={done}
              size="h-3.5 w-3.5"
              className={cn(
                "shrink-0 transition-opacity duration-200",
                done ? "opacity-100" : "opacity-0 group-hover/role:opacity-60"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
