import { motion } from "framer-motion";
import { Download, Palette, Sparkles } from "lucide-react";
import { M3ButtonLink } from "./primitives";

export function Hero({ source }: { source: string }) {
  return (
    <section className="px-4 pb-10 pt-14 sm:pb-16 sm:pt-20" aria-labelledby="hero-title">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--m3-secondary-container)] px-3 text-sm font-medium text-[var(--m3-on-secondary-container)]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Material You · Dynamic color
          </span>

          <h1
            id="hero-title"
            className="mt-5 text-[2.75rem] font-medium leading-[1.08] tracking-tight text-[var(--m3-on-surface)] sm:text-6xl lg:text-[4.25rem]"
          >
            Material 3 for{" "}
            <span className="text-[var(--m3-primary)]">Kubuntu</span>, from one
            color.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--m3-on-surface-variant)]">
            Pick a seed color and generate a complete Material You theme for KDE
            Plasma — tonal color schemes, AI wallpapers, Konsole scheme and a
            one-command installer. Your whole desktop re-tints, Google-style.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <M3ButtonLink href="#download" size="lg">
              <Download className="h-5 w-5" aria-hidden="true" />
              Download theme
            </M3ButtonLink>
            <M3ButtonLink href="#customize" variant="tonal" size="lg">
              <Palette className="h-5 w-5" aria-hidden="true" />
              Pick your color
            </M3ButtonLink>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 text-sm">
            {[
              ["9", "tonal palettes"],
              ["100+", "color roles mapped"],
              ["12", "files in package"],
            ].map(([n, l]) => (
              <div
                key={l}
                className="rounded-2xl bg-[var(--m3-surface-container)] px-4 py-3"
              >
                <dt className="text-2xl font-medium text-[var(--m3-primary)]">
                  {n}
                </dt>
                <dd className="text-[var(--m3-on-surface-variant)]">{l}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
          className="relative mx-auto hidden aspect-square w-full max-w-sm lg:block"
          aria-hidden="true"
        >
          <div className="absolute inset-x-8 bottom-0 top-10 rounded-[3.5rem] bg-[var(--m3-primary-container)] transition-colors duration-500" />
          <div className="absolute bottom-16 right-4 h-36 w-36 rounded-full bg-[var(--m3-tertiary-container)] transition-colors duration-500" />
          <div className="absolute left-2 top-2 h-24 w-24 rounded-full bg-[var(--m3-secondary-container)] transition-colors duration-500" />
          <div className="absolute left-10 top-32 flex h-16 items-center gap-2 rounded-full bg-[var(--m3-inverse-surface)] px-5 text-[var(--m3-inverse-on-surface)] shadow-lg transition-colors duration-500">
            <span
              className="h-5 w-5 rounded-full border-2 border-[var(--m3-inverse-on-surface)]"
              style={{ background: source }}
            />
            <span className="font-mono text-sm">{source}</span>
          </div>
          <div className="absolute bottom-24 left-16 rounded-3xl bg-[var(--m3-surface-container-highest)] px-6 py-5 shadow-xl transition-colors duration-500">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--m3-primary)]">
              Kubuntu 24.04
            </p>
            <p className="mt-1 text-lg font-medium text-[var(--m3-on-surface)]">
              Plasma · M³ Theme
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
