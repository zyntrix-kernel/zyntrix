import {
  FileArchive,
  FileCode2,
  Image as ImageIcon,
  Package,
  Terminal,
} from "lucide-react";
import { M3ButtonLink, SectionHeader } from "./primitives";
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
          <div className="flex flex-col justify-between rounded-[28px] bg-[var(--m3-primary-container)] p-6 text-[var(--m3-on-primary-container)] sm:p-8">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--m3-primary)] text-[var(--m3-on-primary)]">
                <Package className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-2xl font-medium">Complete package</h3>
              <p className="mt-2 text-sm leading-relaxed opacity-90">
                Everything in one <span className="font-mono">.tar.gz</span> —
                light &amp; dark color schemes, Konsole schemes, 3 wallpapers,
                global-theme entry, install &amp; uninstall scripts.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <M3ButtonLink
                href={`/api/theme/package?${q}`}
                variant="elevated"
                size="lg"
                download
              >
                <FileArchive className="h-5 w-5" aria-hidden="true" />
                Download .tar.gz
              </M3ButtonLink>
              <span className="text-xs opacity-80">
                ~7&nbsp;MB · user-level install, no sudo
              </span>
            </div>
          </div>

          {/* Individual files */}
          <div className="grid gap-4 sm:grid-cols-2">
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
            <a
              href="/zyntrix/"
              className="m3-card-interactive group flex items-center gap-4 rounded-[28px] border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-low)] p-5 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-4 sm:col-span-2"
            >
              <img
                src="/zyntrix/svg/zyntrix-z-small.svg"
                alt="Zyntrix logo mark"
                width={40}
                height={40}
                className="h-10 w-10 shrink-0"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-[var(--m3-on-surface)]">
                  Zyntrix brand kit
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-[var(--m3-on-surface-variant)]">
                  The logo behind this site — SVG symbol, lockups, M3 app icon
                  and the full favicon set.
                </span>
              </span>
              <span className="shrink-0 text-sm font-medium text-[var(--m3-primary)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:underline">
                Open showcase →
              </span>
            </a>
          </div>
        </div>

        {/* Wallpaper gallery */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {WALLPAPER_FILES.map((file) => {
            const meta = WALLPAPER_LABELS[file];
            return (
              <figure
                key={file}
                className="overflow-hidden rounded-[28px] border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-low)]"
              >
                <img
                  src={`/wallpapers/${file}`}
                  alt={`${meta.title} Material 3 wallpaper`}
                  className="aspect-video w-full object-cover"
                  loading="lazy"
                />
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
                    href={`/wallpapers/${file}`}
                    download
                    aria-label={`Download ${meta.title} wallpaper`}
                    className="rounded-full p-2.5 text-[var(--m3-primary)] transition-[background-color,transform] duration-200 hover:bg-[var(--m3-secondary-container)] active:scale-90 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2"
                  >
                    <FileArchive className="h-4 w-4" aria-hidden="true" />
                  </a>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
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
      className="m3-card-interactive group flex flex-col rounded-[28px] border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-low)] p-5 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-4"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)]">
        {icon}
      </span>
      <p className="mt-3.5 font-medium text-[var(--m3-on-surface)]">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-[var(--m3-on-surface-variant)]">
        {desc}
      </p>
      <span className="mt-3 text-sm font-medium text-[var(--m3-primary)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:underline">
        Download →
      </span>
    </a>
  );
}
