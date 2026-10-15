"use client";

import { motion } from "framer-motion";
import { Download, Palette, Sparkles } from "lucide-react";
import { M3ButtonLink } from "./primitives";
import type { M3Mode } from "@/lib/m3/theme";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: EASE },
});

export function Hero({ source, mode }: { source: string; mode: M3Mode }) {
  return (
    <section
      className="relative overflow-hidden px-4 pb-12 pt-14 sm:pb-20 sm:pt-24"
      aria-labelledby="hero-title"
    >
      {/* Ambient aurora behind the whole hero */}
      <div
        aria-hidden="true"
        className="m3-aurora anim-drift left-[-10%] top-[-20%] h-[420px] w-[420px] opacity-25"
        style={{ background: "var(--m3-primary)" }}
      />
      <div
        aria-hidden="true"
        className="m3-aurora anim-drift-slow bottom-[-30%] right-[-8%] h-[460px] w-[460px] opacity-20"
        style={{ background: "var(--m3-tertiary)" }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <motion.div {...fadeUp(0)}>
          <motion.span
            {...fadeUp(0.08)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--m3-secondary-container)] px-3 text-sm font-medium text-[var(--m3-on-secondary-container)] shadow-sm"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Zyntrix · Material You · Dynamic color
          </motion.span>

          <motion.h1
            {...fadeUp(0.16)}
            id="hero-title"
            className="mt-5 text-balance text-[2.75rem] font-medium leading-[1.08] tracking-tight text-[var(--m3-on-surface)] sm:text-6xl lg:text-[4.25rem]"
          >
            Material 3 for{" "}
            <span className="text-gradient">Kubuntu</span>, from one
            color.
          </motion.h1>

          <motion.p
            {...fadeUp(0.24)}
            className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--m3-on-surface-variant)]"
          >
            Pick a seed color and generate a complete Material You theme for
            KDE Plasma — tonal color schemes, AI wallpapers, Konsole scheme
            and a one-command installer. Your whole desktop re-tints,
            Google-style.
          </motion.p>

          <motion.div
            {...fadeUp(0.32)}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <M3ButtonLink href="#download" size="lg">
              <Download className="h-5 w-5" aria-hidden="true" />
              Download theme
            </M3ButtonLink>
            <M3ButtonLink href="#customize" variant="tonal" size="lg">
              <Palette className="h-5 w-5" aria-hidden="true" />
              Pick your color
            </M3ButtonLink>
          </motion.div>

          <motion.dl
            {...fadeUp(0.4)}
            className="mt-10 grid max-w-md grid-cols-3 gap-4 text-sm"
          >
            {[
              ["9", "tonal palettes"],
              ["100+", "color roles mapped"],
              ["12", "files in package"],
            ].map(([n, l]) => (
              <div
                key={l}
                className="m3-card rounded-2xl bg-[var(--m3-surface-container)] px-4 py-3"
              >
                <dt className="text-gradient text-2xl font-medium tabular-nums">{n}</dt>
                <dd className="text-[var(--m3-on-surface-variant)]">{l}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className="relative mx-auto hidden aspect-square w-full max-w-sm lg:block"
          aria-hidden="true"
        >
          {/* Glow halo behind the composition */}
          <div
            className="m3-aurora anim-glow-pulse left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 opacity-30"
            style={{ background: "var(--m3-primary)" }}
          />

          <div className="absolute inset-x-8 bottom-0 top-10 rounded-[3.5rem] bg-[var(--m3-primary-container)] shadow-[0_24px_80px_rgba(0,0,0,0.25)] transition-colors duration-500" />
          <div className="absolute bottom-16 right-4 h-36 w-36 rounded-full bg-[var(--m3-tertiary-container)] shadow-inner transition-colors duration-500" />
          <div className="absolute left-2 top-2 h-24 w-24 rounded-full bg-[var(--m3-secondary-container)] transition-colors duration-500" />

          {/* Zyntrix brand mark — floating centerpiece */}
          <img
            src="/zyntrix/svg/zyntrix-app-icon.svg"
            alt="Zyntrix logo — gradient Z with orbit ring and spark"
            width={192}
            height={192}
            className="anim-float absolute left-1/2 top-[9%] w-44 -translate-x-1/2 rounded-[2.25rem] shadow-[0_20px_60px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.06)] transition-transform duration-500 [transition-timing-function:var(--ease-spring)] hover:scale-[1.04]"
          />

          {/* Horizontal lockup card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65, ease: EASE }}
            className="m3-card absolute bottom-6 right-1 rounded-3xl bg-[var(--m3-surface-container-highest)] px-5 py-4 shadow-xl transition-colors duration-500"
          >
            <img
              src={
                mode === "dark"
                  ? "/zyntrix/svg/zyntrix-lockup-horizontal.svg"
                  : "/zyntrix/svg/zyntrix-lockup-horizontal-light.svg"
              }
              alt="Zyntrix — Build · Configure · Explore"
              className="h-12 w-auto sm:h-14"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.75, ease: EASE }}
            className="m3-glass absolute bottom-16 left-1 flex h-16 items-center gap-2 rounded-full px-5 text-[var(--m3-inverse-on-surface)] shadow-lg transition-colors duration-500"
          >
            <span
              className="h-5 w-5 shrink-0 rounded-full border-2 border-[var(--m3-inverse-on-surface)] shadow-inner"
              style={{ background: source }}
            />
            <span className="font-mono text-sm">{source}</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
