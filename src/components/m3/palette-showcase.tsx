import { useState } from "react";
import { hexFromArgb } from "@material/material-color-utilities";
import { useToast } from "@/hooks/use-toast";
import { SHOWCASE_TONES, toneIsDark, type M3Scheme } from "@/lib/m3/theme";

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
    <section id="palette" className="px-4 py-10 sm:py-14" aria-labelledby="palette-title">
      <div className="mx-auto max-w-6xl">
        <h2
          id="palette-title"
          className="text-3xl font-medium tracking-tight text-[var(--m3-on-surface)] sm:text-4xl"
        >
          Tonal palettes
        </h2>
        <p className="mt-3 max-w-2xl text-[var(--m3-on-surface-variant)]">
          Every seed color expands into nine HCT tonal palettes. Click any tone
          to copy its hex value — these are the exact tones written into the
          KDE color scheme.
        </p>

        <div className="m3-scroll mt-8 space-y-6 overflow-x-auto pb-2">
          {ROWS.map(({ label, key }) => (
            <div key={key} className="min-w-[720px]">
              <div className="mb-2 flex items-baseline justify-between px-1">
                <p className="text-sm font-medium text-[var(--m3-on-surface)]">
                  {label}
                </p>
                <p className="font-mono text-[11px] text-[var(--m3-on-surface-variant)]">
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
                      className="group flex h-14 flex-1 flex-col items-center justify-center rounded-xl transition-transform hover:scale-[1.04] focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)]"
                      style={{
                        background: hex,
                        color: toneIsDark(tone) ? "#fff" : "#1d1b20",
                      }}
                    >
                      <span className="text-[10px] font-medium opacity-70">
                        {tone}
                      </span>
                      <span className="hidden font-mono text-[9px] opacity-90 group-hover:block">
                        {copied === hex ? "copied!" : hex.slice(1).toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
