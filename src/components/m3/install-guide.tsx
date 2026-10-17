"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { M3Mode } from "@/lib/m3/theme";
import { cn } from "@/lib/utils";
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

        <ol className="relative mt-8 space-y-4">
          {steps.map((step, i) => (
            <StepItem key={step.title} index={i} last={i === steps.length - 1}>
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--m3-primary)] text-lg font-medium tabular-nums text-[var(--m3-on-primary)] shadow-[0_2px_10px_color-mix(in_srgb,var(--m3-primary)_40%,transparent)]"
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
            </StepItem>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Step row with a timeline segment that draws itself when scrolled into view */
function StepItem({
  index,
  last,
  children,
}: {
  index: number;
  last: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLLIElement | null>(null);
  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.19, 1, 0.22, 1] }}
      className="relative flex flex-col gap-4 rounded-[28px] bg-[var(--m3-surface-container-low)] p-5 sm:flex-row sm:items-start sm:p-6"
    >
      {!last && (
        <>
          {/* timeline track */}
          <span
            aria-hidden="true"
            className="absolute left-10 top-[4.25rem] -bottom-9 hidden w-px bg-[var(--m3-outline-variant)] sm:left-11 sm:block"
          />
          {/* timeline fill — draws downward when the step enters */}
          <motion.span
            aria-hidden="true"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-10 top-[4.25rem] -bottom-9 hidden w-px origin-top bg-gradient-to-b from-[var(--m3-primary)] to-[var(--m3-tertiary)] sm:left-11 sm:block"
          />
        </>
      )}
      {children}
    </motion.li>
  );
}

function CodeBlock({ code }: { code: string }) {
  const copiedRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({ title: "Command copied" });
      if (copiedRef.current) clearTimeout(copiedRef.current);
      copiedRef.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      toast({ title: "Copy failed", description: "Clipboard unavailable" });
    }
  };

  return (
    <div className="group/code relative mt-3 overflow-hidden rounded-2xl bg-[var(--m3-inverse-surface)]">
      <pre className="m3-scroll overflow-x-auto p-4 pr-12 font-mono text-[13px] leading-relaxed text-[var(--m3-inverse-on-surface)]">
        {code}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy command"
        aria-live="polite"
        className={cn(
          "absolute right-2 top-2 z-10 rounded-full p-2 text-[var(--m3-inverse-on-surface)] transition-[background-color,scale] duration-200 [transition-timing-function:var(--ease-spring)] hover:bg-white/10 active:scale-90 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2",
          copied && "scale-110"
        )}
      >
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.4, rotate: -25, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 560, damping: 28 }}
            className="grid place-items-center"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
          </motion.span>
        ) : (
          <Copy
            className="h-4 w-4 transition-transform duration-300 [transition-timing-function:var(--ease-spring)] group-hover/code:-translate-y-px group-hover/code:scale-110"
            aria-hidden="true"
          />
        )}
      </button>
      {/* copied flash ring */}
      {copied && (
        <motion.span
          aria-hidden="true"
          initial={{ opacity: 0.5, scale: 0.6 }}
          animate={{ opacity: 0, scale: 1.6 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="pointer-events-none absolute right-1.5 top-1.5 h-8 w-8 rounded-full border-2 border-[var(--m3-inverse-on-surface)]"
        />
      )}
    </div>
  );
}
