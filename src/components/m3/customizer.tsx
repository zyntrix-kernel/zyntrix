import { Pipette } from "lucide-react";
import { SEED_PRESETS, type M3Mode } from "@/lib/m3/theme";

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
    <section id="customize" className="px-4 py-10 sm:py-14" aria-labelledby="customize-title">
      <div className="mx-auto max-w-6xl">
        <h2
          id="customize-title"
          className="text-3xl font-medium tracking-tight text-[var(--m3-on-surface)] sm:text-4xl"
        >
          Theme customizer
        </h2>
        <p className="mt-3 max-w-2xl text-[var(--m3-on-surface-variant)]">
          Choose a seed color. Everything on this page — including the live
          Plasma preview and every generated file — re-tints instantly using
          the same Material color engine that powers Android &amp; ChromeOS.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="rounded-[28px] bg-[var(--m3-surface-container-low)] p-6 sm:p-8">
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
                    className={`group flex flex-col items-center gap-2 rounded-2xl p-2 transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] ${
                      selected ? "bg-[var(--m3-secondary-container)]" : ""
                    }`}
                  >
                    <span
                      className={`block h-14 w-14 rounded-full shadow-md transition-shadow ${
                        selected
                          ? "ring-2 ring-[var(--m3-on-surface)] ring-offset-2 ring-offset-[var(--m3-surface-container-low)]"
                          : ""
                      }`}
                      style={{ background: preset.hex }}
                    />
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
              <label className="flex items-center gap-4 rounded-full bg-[var(--m3-surface-container-highest)] py-2 pl-2 pr-5">
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
                className="flex h-12 rounded-full border border-[var(--m3-outline)] p-1"
              >
                {(["light", "dark"] as M3Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={mode === m}
                    onClick={() => onModeChange(m)}
                    className={`h-full rounded-full px-5 text-sm font-medium capitalize transition-colors ${
                      mode === m
                        ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)]"
                        : "text-[var(--m3-on-surface-variant)] hover:bg-[var(--m3-surface-container-highest)]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-[28px] bg-[var(--m3-primary-container)] p-6 text-[var(--m3-on-primary-container)] sm:p-8 lg:w-72">
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
                    <span className="ml-auto text-xs opacity-70">
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
        </div>
      </div>
    </section>
  );
}
