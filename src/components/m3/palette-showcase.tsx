"use client";

import { motion, type Variants } from "framer-motion";
import { Check } from "lucide-react";
import {
  SHOWCASE_TONES,
  toneIsDark,
  toneToHex,
  type M3Scheme,
} from "@/lib/m3/theme";
import { cn } from "@/lib/utils";
import {
  StateLayer,
  useCopyFlash,
  useInteractiveSurface,
} from "./interactive";
import { Reveal, SectionHeader } from "./primitives";

const ROWS: { label: string; key: keyof M3Scheme["palettes"] }[] = [
  { label: "Primary", key: "primary" },
  { label: "Secondary", key: "secondary" },
  { label: "Tertiary", key: "tertiary" },
  { label: "Error", key: "error" },
  { label: "Neutral", key: "neutral" },
  { label: "Neutral variant", key: "neutralVariant" },
];

const toneRow: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.018 } },
};
const toneCell: Variants = {
  hidden: { opacity: 0, scaleY: 0.4 },
  show: {
    opacity: 1,
    scaleY: 1,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
};

export function PaletteShowcase({ scheme }: { scheme: M3Scheme }) {
  const { copied, copy } = useCopyFlash();

  return (
    <section id="palette" className="px-4 py-14 sm:py-20" aria-labelledby="palette-title">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          id="palette-title"
          eyebrow="Tonal palettes"
          title={<>Tonal palettes, tone by tone</>}
        >
          Every seed color expands into nine HCT tonal palettes. Click any tone
          to copy its hex value — these are the exact tones written into the
          KDE color scheme.
        </SectionHeader>

        <div className="m3-scroll mt-8 space-y-6 overflow-x-auto pb-2">
          {ROWS.map(({ label, key }, i) => (
            <Reveal key={key} delay={i * 0.06}>
              <div className="min-w-[720px]">
                <div className="mb-2 flex items-baseline justify-between px-1">
                  <p className="text-sm font-medium text-[var(--m3-on-surface)]">
                    {label}
                  </p>
                  <p className="font-mono text-[11px] tabular-nums text-[var(--m3-on-surface-variant)]">
                    hue {Math.round(scheme.palettes[key].hue)} · chroma{" "}
                    {Math.round(scheme.palettes[key].chroma)}
                  </p>
                </div>
                <motion.div
                  variants={toneRow}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  className="flex gap-1.5"
                >
                  {SHOWCASE_TONES.map((tone) => {
                    // Cached resolver — the grid resolves 72 tones per render
                    const hex = toneToHex(scheme.palettes[key], tone);
                    const done = copied === `${key}-${tone}`;
                    return (
                      <ToneCell
                        key={tone}
                        tone={tone}
                        hex={hex}
                        done={done}
                        label={label}
                        rowKey={key}
                        onCopy={() =>
                          copy(`${key}-${tone}`, hex.toUpperCase(), `${label} ${tone} · ${hex.toUpperCase()}`)
                        }
                      />
                    );
                  })}
                </motion.div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ToneCell({
  tone,
  hex,
  done,
  label,
  rowKey,
  onCopy,
}: {
  tone: number;
  hex: string;
  done: boolean;
  label: string;
  rowKey: string;
  onCopy: () => void;
}) {
  const { ref, surfaceProps } = useInteractiveSurface<HTMLButtonElement>({
    bloomRadius: 90,
  });
  return (
    <motion.button
      ref={ref}
      variants={toneCell}
      type="button"
      onClick={onCopy}
      aria-label={`Copy ${label} tone ${tone} ${hex}`}
      title={`${tone} · ${hex}`}
      className={cn(
        "group relative flex h-14 flex-1 origin-bottom flex-col items-center justify-center overflow-hidden rounded-2xl transition-[scale,box-shadow] duration-200 [transition-timing-function:var(--ease-out-quint)] hover:z-10 hover:scale-[1.09] hover:shadow-[0_10px_28px_-4px_var(--tone)] active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2",
        done && "scale-[1.06] ring-2 ring-[var(--m3-on-surface)]/50"
      )}
      {...surfaceProps}
      style={{
        background: hex,
        color: toneIsDark(tone) ? "#fff" : "#1d1b20",
        ["--tone" as string]: hex,
      }}
    >
      <StateLayer />
      <span className="relative z-10 text-[10px] font-medium opacity-70">
        {tone}
      </span>
      <span className="relative z-10 grid h-[13px] place-items-center font-mono text-[9px] opacity-90">
        {done ? (
          <motion.span
            key="done"
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-0.5"
          >
            <Check className="h-2.5 w-2.5" strokeWidth={3.5} aria-hidden="true" />
            COPIED
          </motion.span>
        ) : (
          <span className="hidden group-hover:block">
            {hex.slice(1).toUpperCase()}
          </span>
        )}
      </span>
    </motion.button>
  );
}
