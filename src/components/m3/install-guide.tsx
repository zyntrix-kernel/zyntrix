import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { M3Mode } from "@/lib/m3/theme";
import { SectionHeader } from "./primitives";

export function InstallGuide({ mode }: { mode: M3Mode }) {
  const scheme = mode === "dark" ? "M3KubuntuDark" : "M3KubuntuLight";

  const steps: { title: string; body: string; code?: string }[] = [
    {
      title: "Download & extract",
      body: "Grab the complete package above, then extract it anywhere in your home folder.",
      code: "tar -xzf m3-kubuntu-*.tar.gz && cd m3-kubuntu",
    },
    {
      title: "Run the installer",
      body: "The script installs everything into ~/.local/share — no root required.",
      code: "chmod +x install.sh uninstall.sh && ./install.sh",
    },
    {
      title: "Apply the theme",
      body: "System Settings → Colors & Themes → Colors → pick “M3 Kubuntu”. Or use the CLI:",
      code: `plasma-apply-colorscheme ${scheme}\nplasma-apply-wallpaperimage ~/.local/share/wallpapers/M3Kubuntu/contents/images/m3-wallpaper-${mode}.png`,
    },
    {
      title: "Go full Material You (optional)",
      body: "For rounded window corners and icon theming, install these extras from the Kubuntu repos:",
      code: "sudo apt install papirus-icon-theme kvantum\n# Window decorations: System Settings → Window Decorations →\n# Get New… → search “Klassy” → set corner radius 16px",
    },
  ];

  return (
    <section id="install" className="px-4 py-14 sm:py-20" aria-labelledby="install-title">
      <div className="mx-auto max-w-6xl">
        <SectionHeader eyebrow="Setup" id="install-title" title={<>Installation guide</>}>
          Works on Kubuntu 22.04+ and any KDE Plasma 5.27 / Plasma 6 system.
        </SectionHeader>

        <ol className="mt-8 space-y-4">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="flex flex-col gap-4 rounded-[28px] bg-[var(--m3-surface-container-low)] p-5 sm:flex-row sm:items-start sm:p-6"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--m3-primary)] text-lg font-medium tabular-nums text-[var(--m3-on-primary)]"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-[var(--m3-on-surface)]">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--m3-on-surface-variant)]">
                  {step.body}
                </p>
                {step.code && <CodeBlock code={step.code} />}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({ title: "Command copied" });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ title: "Copy failed", description: "Clipboard unavailable" });
    }
  };

  return (
    <div className="relative mt-3 overflow-hidden rounded-2xl bg-[var(--m3-inverse-surface)]">
      <pre className="m3-scroll overflow-x-auto p-4 pr-12 font-mono text-[13px] leading-relaxed text-[var(--m3-inverse-on-surface)]">
        {code}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy command"
        className="absolute right-2 top-2 rounded-full p-2 text-[var(--m3-inverse-on-surface)] transition-[background-color,transform] duration-200 hover:bg-white/10 active:scale-90 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2"
      >
        {copied ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
