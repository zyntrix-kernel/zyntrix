import { useState } from "react";
import { hexFromArgb } from "@material/material-color-utilities";
import { useToast } from "@/hooks/use-toast";
import { SHOWCASE_TONES, toneIsDark, type M3Scheme } from "@/lib/m3/theme";
import { Reveal, SectionHeader } from "./primitives";

const ROWS: { label: string; key: keyof M3Scheme["palettes"] }[] = [
  { label: "Primary", key: "primary" },
  { label: "Secondary", key: "secondary" },
  { label: "Tertiary", key: "tertiary" },
  { label: "Error", key: "error" },
  { label: "Neutral", key: "neutral" },
  { label: "Neutral variant", key: "neutralVariant" },
];

export function PaletteShowcase({ scheme }: { scheme: M3Scheme }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
      toast({
        title: "Copied to clipboard",
        description: hex.toUpperCase(),
      });
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast({ title: "Copy failed", description: "Clipboard unavailable" });
    }
  };

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
                <div className="flex gap-1.5">
                  {SHOWCASE_TONES.map((tone) => {
                    const hex = hexFromArgb(scheme.palettes[key].tone(tone));
                    return (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => copy(hex)}
                        aria-label={`Copy ${label} tone ${tone} ${hex}`}
                        title={`${tone} · ${hex}`}
                        className="group flex h-14 flex-1 flex-col items-center justify-center rounded-2xl transition-[transform,box-shadow] duration-200 [transition-timing-function:var(--ease-out-quint)] hover:scale-105 hover:ring-2 hover:ring-[var(--m3-on-surface)]/30 active:scale-95 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)]"
                        style={{
                          background: hex,
                          color: toneIsDark(tone) ? "#fff" : "#1d1b20",
                        }}
                      >
                        <span className="text-[10px] font-medium opacity-70">
                          {tone}
                        </span>
                        <span
                          className={
                            copied === hex
                              ? "block font-mono text-[9px] opacity-90"
                              : "hidden font-mono text-[9px] opacity-90 group-hover:block"
                          }
                        >
                          {copied === hex
                            ? `✓ ${hex.slice(1).toUpperCase()}`
                            : hex.slice(1).toUpperCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
