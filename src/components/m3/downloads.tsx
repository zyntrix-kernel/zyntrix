"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  FileArchive,
  FileCode2,
  Image as ImageIcon,
  Package,
  Terminal,
} from "lucide-react";
import { M3ButtonLink, Reveal, SectionHeader } from "./primitives";
import { StateLayer, useInteractiveSurface } from "./interactive";
import { WALLPAPER_FILES } from "@/lib/m3/theme";
import type { M3Mode } from "@/lib/m3/theme";

const WALLPAPER_LABELS: Record<string, { title: string; desc: string }> = {
  "m3-wallpaper-light.png": {
    title: "Serene Light",
    desc: "Soft ivory + tonal blobs",
  },
  "m3-wallpaper-dark.png": {
    title: "Midnight Tonal",
    desc: "Charcoal + muted plum",
  },
  "m3-wallpaper-bloom.png": {
    title: "Dynamic Bloom",
    desc: "Flowing gradient waves",
  },
};

export function Downloads({ source, mode }: { source: string; mode: M3Mode }) {
  const q = `source=${encodeURIComponent(source)}&mode=${mode}`;

  return (
    <section id="download" className="px-4 py-14 sm:py-20" aria-labelledby="download-title">
      <div className="mx-auto max-w-6xl">
        <SectionHeader eyebrow="Get the files" id="download-title" title={<>Download the theme</>}>
          Every file below is generated live on the server with your current
          seed color ({source}) and {mode} default scheme.
        </SectionHeader>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          {/* Full package */}
          <Reveal className="h-full">
          <div className="group/package relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] bg-[var(--m3-primary-container)] p-6 text-[var(--m3-on-primary-container)] shadow-[0_16px_50px_-18px_color-mix(in_srgb,var(--m3-primary)_35%,transparent)] transition-[box-shadow] duration-500 [transition-timing-function:var(--ease-enter)] hover:shadow-[0_22px_60px_-16px_color-mix(in_srgb,var(--m3-primary)_50%,transparent)] sm:p-8">
            {/* hover sheen sweep */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -translate-x-[160%] skew-x-[-18deg] bg-[linear-gradient(100deg,transparent_30%,rgba(255,255,255,0.14)_50%,transparent_70%)] transition-transform duration-[1100ms] [transition-timing-function:var(--ease-move)] group-hover/package:translate-x-[160%]"
            />
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--m3-primary)] text-[var(--m3-on-primary)] transition-transform duration-500 [transition-timing-function:var(--ease-spring)] group-hover/package:-rotate-6 group-hover/package:scale-110">
                <Package className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-2xl font-medium">Complete package</h3>
              <p className="mt-2 text-sm leading-relaxed opacity-90">
                Everything in one <span className="font-mono">.tar.gz</span> —
                light &amp; dark color schemes, Konsole schemes, 3 wallpapers,
                global-theme entry, install &amp; uninstall scripts.
              </p>
            </div>
            <div className="relative mt-6 flex flex-wrap items-center gap-3">
              <M3ButtonLink
                href={`/api/theme/package?${q}`}
                variant="elevated"
                size="lg"
                download
              >
                <FileArchive className="h-5 w-5 transition-transform duration-300 [transition-timing-function:var(--ease-spring)] group-hover:-translate-y-0.5 group-hover:scale-110" aria-hidden="true" />
                Download .tar.gz
              </M3ButtonLink>
              <span className="text-xs opacity-80">
                ~7&nbsp;MB · user-level install, no sudo
              </span>
            </div>
          </div>
          </Reveal>

          {/* Individual files */}
          <Reveal delay={0.08} className="h-full">
          <div className="grid h-full gap-4 sm:grid-cols-2">
            <FileCard
              icon={<FileCode2 className="h-5 w-5" aria-hidden="true" />}
              title="KDE color scheme"
              desc={`M3Kubuntu${mode === "dark" ? "Dark" : "Light"}.colors — Plasma + all Qt/KDE apps`}
              href={`/api/theme/kde-colors?${q}`}
            />
            <FileCard
              icon={<Terminal className="h-5 w-5" aria-hidden="true" />}
              title="Konsole scheme"
              desc={`M3Kubuntu${mode === "dark" ? "Dark" : "Light"}.colorscheme — ANSI-mapped tones`}
              href={`/api/theme/konsole?${q}`}
            />
            <FileCard
              icon={<FileCode2 className="h-5 w-5" aria-hidden="true" />}
              title="install.sh"
              desc="Copies files + applies via plasma CLI"
              href={`/api/theme/install-script?${q}`}
            />
            <FileCard
              icon={<ImageIcon className="h-5 w-5" aria-hidden="true" />}
              title="Wallpapers (3)"
              desc="AI-generated Material You backdrops"
              href={WALLPAPER_FILES[mode === "dark" ? 1 : 0]}
              direct
            />

            {/* Zyntrix brand kit */}
            <BrandKitCard />
          </div>
          </Reveal>
        </div>

        {/* Wallpaper gallery */}
        <Reveal delay={0.1}>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {WALLPAPER_FILES.map((file, i) => (
            <WallpaperCard key={file} file={file} index={i} />
          ))}
        </div>
        </Reveal>
      </div>
    </section>
  );
}

function BrandKitCard() {
  const { ref, surfaceProps } = useInteractiveSurface<HTMLAnchorElement>({
    bloomRadius: 200,
  });
  return (
    <a
      ref={ref}
      href="/zyntrix/"
      className="group m3-card-interactive relative flex items-center gap-4 overflow-hidden rounded-[28px] border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-low)] p-5 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-4 sm:col-span-2"
      {...surfaceProps}
    >
      <StateLayer />
      <motion.img
        src="/zyntrix/svg/zyntrix-z-small.svg"
        alt="Zyntrix logo mark"
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 transition-transform duration-500 [transition-timing-function:var(--ease-spring)] group-hover:scale-110 group-hover:-rotate-6"
      />
      <span className="relative z-10 min-w-0 flex-1">
        <span className="block font-medium text-[var(--m3-on-surface)]">
          Zyntrix brand kit
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-[var(--m3-on-surface-variant)]">
          The logo behind this site — SVG symbol, lockups, M3 app icon
          and the full favicon set.
        </span>
      </span>
      <span className="relative z-10 inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[var(--m3-primary)]">
        Open showcase
        <ArrowRight className="h-4 w-4 transition-transform duration-300 [transition-timing-function:var(--ease-spring)] group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </a>
  );
}

function WallpaperCard({ file, index }: { file: string; index: number }) {
  const meta = WALLPAPER_LABELS[file];
  const { ref, surfaceProps } = useInteractiveSurface<HTMLAnchorElement>({
    ripple: false,
  });
  return (
    <figure className="group overflow-hidden rounded-[28px] border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-low)] transition-[box-shadow,border-color] duration-500 [transition-timing-function:var(--ease-enter)] hover:border-[color-mix(in_srgb,var(--m3-primary)_38%,var(--m3-outline-variant))] hover:shadow-[0_14px_40px_-14px_color-mix(in_srgb,var(--m3-primary)_30%,transparent)]">
      <div className="overflow-hidden">
        <motion.img
          src={`/wallpapers/${file}`}
          alt={`${meta.title} Material 3 wallpaper`}
          className="aspect-video w-full object-cover transition-transform duration-[900ms] [transition-timing-function:var(--ease-out-quint)] group-hover:scale-[1.06]"
          loading="lazy"
          initial={{ opacity: 0, scale: 1.04 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, delay: index * 0.07, ease: [0.19, 1, 0.22, 1] }}
        />
      </div>
      <figcaption className="flex items-center justify-between gap-2 p-4">
        <div>
          <p className="text-sm font-medium text-[var(--m3-on-surface)]">
            {meta.title}
          </p>
          <p className="text-xs text-[var(--m3-on-surface-variant)]">
            {meta.desc}
          </p>
        </div>
        <a
          ref={ref}
          href={`/wallpapers/${file}`}
          download
          aria-label={`Download ${meta.title} wallpaper`}
          className="relative grid place-items-center overflow-hidden rounded-full p-2.5 text-[var(--m3-primary)] transition-[background-color,scale] duration-200 [transition-timing-function:var(--ease-spring)] hover:bg-[var(--m3-secondary-container)] hover:scale-110 active:scale-90 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2"
          {...surfaceProps}
        >
          <StateLayer />
          <FileArchive className="relative z-10 h-4 w-4" aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  );
}

function FileCard({
  icon,
  title,
  desc,
  href,
  direct,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
  direct?: boolean;
}) {
  return (
    <a
      href={direct ? href : `${href}${href.includes("?") ? "&" : "?"}download=1`}
      download
      className="group m3-card-interactive relative flex flex-col rounded-[28px] border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-low)] p-5 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-4"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)] transition-[scale,rotate] duration-300 [transition-timing-function:var(--ease-spring)] group-hover:rotate-[-6deg] group-hover:scale-110">
        {icon}
      </span>
      <p className="mt-3.5 font-medium text-[var(--m3-on-surface)]">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-[var(--m3-on-surface-variant)]">
        {desc}
      </p>
      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--m3-primary)]">
        Download
        <ArrowRight className="arrow-pass h-4 w-4" aria-hidden="true" />
      </span>
    </a>
  );
}
