"use client";

import { motion } from "framer-motion";
import { Pipette } from "lucide-react";
import { SEED_PRESETS, type M3Mode } from "@/lib/m3/theme";
import { Reveal, SectionHeader } from "./primitives";

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
            <div className="mt-4 flex flex-wrap gap-3">
              {SEED_PRESETS.map((preset) => {
                const selected = source === preset.hex;
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => onSourceChange(preset.hex)}
                    aria-pressed={selected}
                    aria-label={`Use ${preset.name} seed color`}
                    className={`group flex flex-col items-center gap-2 rounded-2xl p-2 transition-transform duration-200 [transition-timing-function:var(--ease-enter)] hover:scale-[1.03] active:scale-95 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2 ${
                      selected ? "bg-[var(--m3-secondary-container)]" : ""
                    }`}
                  >
                    <span
                      className="relative block h-14 w-14 rounded-full shadow-md transition-shadow duration-300 group-hover:shadow-[0_6px_26px_var(--swatch-glow)]"
                      style={{
                        background: preset.hex,
                        ["--swatch-glow" as string]: `color-mix(in srgb, ${preset.hex} 55%, transparent)`,
                      }}
                    >
                      {selected && (
                        <motion.span
                          layoutId="seed-ring"
                          className="absolute -inset-[5px] rounded-full ring-2 ring-[var(--m3-on-surface)]"
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                          aria-hidden="true"
                        />
                      )}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        selected
                          ? "text-[var(--m3-on-secondary-container)]"
                          : "text-[var(--m3-on-surface-variant)]"
                      }`}
                    >
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <label className="flex items-center gap-4 rounded-full bg-[var(--m3-surface-container-highest)] py-2 pl-2 pr-5 transition-[background-color] focus-within:ring-2 focus-within:ring-[var(--m3-primary)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--m3-surface-container-low)]">
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
                  <span className="font-mono text-sm font-medium text-[var(--m3-on-surface)]">
                    {source}
                  </span>
                </span>
                <Pipette
                  className="ml-auto h-4 w-4 text-[var(--m3-on-surface-variant)]"
                  aria-hidden="true"
                />
              </label>

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
                      className={`relative h-full rounded-full px-5 text-sm font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2 ${
                        active
                          ? "text-[var(--m3-on-primary)]"
                          : "text-[var(--m3-on-surface-variant)] hover:bg-[var(--m3-surface-container-highest)]"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="mode-thumb"
                          className="absolute inset-0 rounded-full bg-[var(--m3-primary)]"
                          transition={{ type: "spring", stiffness: 480, damping: 40 }}
                          aria-hidden="true"
                        />
                      )}
                      <span className="relative z-10">{m}</span>
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
              <div className="mt-4 space-y-2.5 font-mono text-sm">
                {[
                  ["Primary", "primary"],
                  ["Secondary", "secondary"],
                  ["Tertiary", "tertiary"],
                  ["Error", "error"],
                  ["Surface", "surface"],
                ].map(([label, role]) => (
                  <div key={role} className="flex items-center gap-3">
                    <span
                      className="h-6 w-6 rounded-full border border-black/10 shadow-sm"
                      style={{ background: `var(--m3-${role})` }}
                    />
                    <span className="capitalize">{label}</span>
                    <span className="ml-auto font-mono text-xs opacity-70">
                      {roles[role]?.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
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
