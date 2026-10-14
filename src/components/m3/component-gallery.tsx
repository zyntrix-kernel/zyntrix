import { useState } from "react";
import { Bookmark, Home, Pencil, Plus, Search, Settings, ThumbsUp } from "lucide-react";
import { M3Button, M3Chip, M3Fab, M3Switch } from "./primitives";

export function ComponentGallery() {
  const [sw, setSw] = useState(true);
  const [chip, setChip] = useState(true);
  const [chip2, setChip2] = useState(false);

  return (
    <section id="components" className="px-4 py-10 sm:py-14" aria-labelledby="components-title">
      <div className="mx-auto max-w-6xl">
        <h2
          id="components-title"
          className="text-3xl font-medium tracking-tight text-[var(--m3-on-surface)] sm:text-4xl"
        >
          Component gallery
        </h2>
        <p className="mt-3 max-w-2xl text-[var(--m3-on-surface-variant)]">
          The same design language your apps will speak once the theme is
          applied — buttons, chips, fields and cards straight from the M3
          specification.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Buttons */}
          <GalleryCard title="Buttons">
            <div className="flex flex-wrap items-center gap-3">
              <M3Button variant="filled">Filled</M3Button>
              <M3Button variant="tonal">Tonal</M3Button>
              <M3Button variant="outlined">Outlined</M3Button>
              <M3Button variant="text">Text</M3Button>
              <M3Button variant="filled" disabled>
                Disabled
              </M3Button>
            </div>
          </GalleryCard>

          {/* FABs */}
          <GalleryCard title="Floating action buttons">
            <div className="flex items-center gap-4">
              <M3Fab size="sm" label="Edit">
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </M3Fab>
              <M3Fab label="Create">
                <Plus className="h-6 w-6" aria-hidden="true" />
              </M3Fab>
              <M3Fab extended label="Compose">
                <Plus className="h-5 w-5" aria-hidden="true" />
                Compose
              </M3Fab>
            </div>
          </GalleryCard>

          {/* Chips */}
          <GalleryCard title="Chips">
            <div className="flex flex-wrap gap-2">
              <M3Chip icon={<Search className="h-4 w-4" aria-hidden="true" />}>
                Assist
              </M3Chip>
              <M3Chip selected={chip} onClick={() => setChip(!chip)}>
                Filter · KDE
              </M3Chip>
              <M3Chip selected={chip2} onClick={() => setChip2(!chip2)}>
                Filter · GTK
              </M3Chip>
            </div>
          </GalleryCard>

          {/* Switch + slider + radio */}
          <GalleryCard title="Selection controls">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-[var(--m3-on-surface)]">
                  Color from wallpaper
                </span>
                <M3Switch checked={sw} onCheckedChange={setSw} label="Color from wallpaper" />
              </div>
              <div
                className="flex items-center gap-3"
                role="radiogroup"
                aria-label="Example radio group"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--m3-primary)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--m3-primary)]" />
                </span>
                <span className="text-sm text-[var(--m3-on-surface)]">Dynamic</span>
                <span className="ml-3 h-5 w-5 rounded-full border-2 border-[var(--m3-outline)]" />
                <span className="text-sm text-[var(--m3-on-surface-variant)]">Static</span>
              </div>
              <div
                className="h-1.5 w-full rounded-full"
                style={{ background: "var(--m3-surface-container-highest)" }}
                role="progressbar"
                aria-valuenow={60}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-1.5 w-[60%] rounded-full"
                  style={{ background: "var(--m3-primary)" }}
                />
              </div>
            </div>
          </GalleryCard>

          {/* Text field */}
          <GalleryCard title="Text field (filled)">
            <label className="block">
              <span className="px-4 text-xs font-medium text-[var(--m3-primary)]">
                Wallpaper search
              </span>
              <div className="rounded-t-xl border-b-2 border-[var(--m3-on-surface-variant)] bg-[var(--m3-surface-container-highest)] px-4 pb-2 pt-0.5 transition-colors focus-within:border-[var(--m3-primary)]">
                <input
                  className="w-full bg-transparent text-sm text-[var(--m3-on-surface)] outline-none placeholder:text-[var(--m3-on-surface-variant)]"
                  placeholder="Type a color name…"
                  aria-label="Wallpaper search"
                />
              </div>
            </label>
          </GalleryCard>

          {/* Cards */}
          <GalleryCard title="Cards">
            <div className="grid gap-2.5 sm:grid-cols-3">
              <div className="rounded-2xl bg-[var(--m3-surface-container-low)] p-3 shadow-md">
                <p className="text-xs font-medium text-[var(--m3-on-surface)]">Elevated</p>
                <p className="mt-0.5 text-[11px] text-[var(--m3-on-surface-variant)]">shadow · tonal</p>
              </div>
              <div className="rounded-2xl bg-[var(--m3-surface-container-highest)] p-3">
                <p className="text-xs font-medium text-[var(--m3-on-surface)]">Filled</p>
                <p className="mt-0.5 text-[11px] text-[var(--m3-on-surface-variant)]">no shadow</p>
              </div>
              <div className="rounded-2xl border border-[var(--m3-outline)] p-3">
                <p className="text-xs font-medium text-[var(--m3-on-surface)]">Outlined</p>
                <p className="mt-0.5 text-[11px] text-[var(--m3-on-surface-variant)]">1dp border</p>
              </div>
            </div>
          </GalleryCard>

          {/* Navigation bar */}
          <GalleryCard title="Navigation bar">
            <nav
              className="flex items-center justify-around rounded-3xl bg-[var(--m3-surface-container)] px-2 py-2"
              aria-label="Example M3 navigation bar"
            >
              {[
                { icon: Home, label: "Home", active: true },
                { icon: Bookmark, label: "Saved" },
                { icon: ThumbsUp, label: "Liked" },
                { icon: Settings, label: "Settings" },
              ].map(({ icon: Icon, label, active }) => (
                <span key={label} className="flex flex-col items-center gap-0.5">
                  <span
                    className={`flex h-8 w-14 items-center justify-center rounded-full ${
                      active ? "bg-[var(--m3-secondary-container)]" : ""
                    }`}
                  >
                    <Icon
                      className={`h-4.5 w-4.5 ${active ? "text-[var(--m3-on-secondary-container)]" : "text-[var(--m3-on-surface-variant)]"}`}
                      aria-hidden="true"
                    />
                  </span>
                  <span
                    className={`text-[10px] font-medium ${
                      active ? "text-[var(--m3-on-surface)]" : "text-[var(--m3-on-surface-variant)]"
                    }`}
                  >
                    {label}
                  </span>
                </span>
              ))}
            </nav>
          </GalleryCard>

          {/* Snackbar */}
          <GalleryCard title="Snackbar">
            <div className="flex items-center gap-3 rounded-xl bg-[var(--m3-inverse-surface)] px-4 py-3.5 text-[var(--m3-inverse-on-surface)]">
              <p className="text-sm">Theme applied</p>
              <span className="ml-auto text-sm font-medium uppercase text-[var(--m3-inverse-primary)]">
                Undo
              </span>
            </div>
          </GalleryCard>

          {/* Badges */}
          <GalleryCard title="Badges">
            <div className="flex items-center gap-5">
              <span className="relative inline-flex">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)]">
                  <Pencil className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--m3-error)] px-1 text-[9px] font-medium text-[var(--m3-on-error)]">
                  3
                </span>
              </span>
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--m3-error)]" aria-label="Small badge" />
              <span className="rounded-lg bg-[var(--m3-tertiary-container)] px-2.5 py-1 text-xs font-medium text-[var(--m3-on-tertiary-container)]">
                Plasma 6 ready
              </span>
            </div>
          </GalleryCard>
        </div>
      </div>
    </section>
  );
}

function GalleryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-low)] p-6">
      <h3 className="mb-5 text-sm font-medium uppercase tracking-wider text-[var(--m3-primary)]">
        {title}
      </h3>
      {children}
    </div>
  );
}
