import { useState } from "react";
import {
  BatteryFull,
  Download,
  FileText,
  Film,
  Folder,
  Home,
  Image as ImageIcon,
  Music,
  Palette,
  Settings,
  Trash2,
  Volume2,
  Wifi,
} from "lucide-react";
import { M3Chip, SectionHeader } from "./primitives";
import type { M3Mode } from "@/lib/m3/theme";

const WALLPAPERS = [
  { id: "light", src: "/wallpapers/m3-wallpaper-light.png", label: "Light" },
  { id: "dark", src: "/wallpapers/m3-wallpaper-dark.png", label: "Dark" },
  { id: "bloom", src: "/wallpapers/m3-wallpaper-bloom.png", label: "Bloom" },
] as const;

type WallId = (typeof WALLPAPERS)[number]["id"];

export function DesktopPreview({ mode }: { mode: M3Mode }) {
  // Component is remounted on mode change (keyed by parent), so this only
  // initializes the default wallpaper for the current mode.
  const [wall, setWall] = useState<WallId>(mode === "dark" ? "dark" : "light");

  return (
    <section id="preview" className="px-4 py-14 sm:py-20" aria-labelledby="preview-title">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          id="preview-title"
          eyebrow="Live mock"
          title={<>Live Plasma preview</>}
        >
          A faithful mock of Kubuntu with the generated theme applied —
          top panel, Dolphin, Konsole and System Settings, all tinted from
          your seed color.
        </SectionHeader>

        <div role="group" aria-label="Choose preview wallpaper" className="mt-6 flex gap-2">
          {WALLPAPERS.map((w) => (
            <M3Chip
              key={w.id}
              selected={wall === w.id}
              onClick={() => setWall(w.id)}
              ariaLabel={`Preview with ${w.label} wallpaper`}
            >
              {w.label}
            </M3Chip>
          ))}
        </div>

        <div className="relative mt-8 overflow-hidden rounded-[28px] shadow-2xl ring-1 ring-black/20">
          {/* Wallpaper — all three stacked and preloaded, crossfaded via opacity */}
          {WALLPAPERS.map((w) => (
            <img
              key={w.id}
              src={w.src}
              alt={`Material 3 ${w.label} wallpaper`}
              aria-hidden={wall !== w.id ? true : undefined}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 [transition-timing-function:var(--ease-enter)] ${
                wall === w.id ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          <div className="relative aspect-[16/11] sm:aspect-[16/9]">
            {/* ---- Top panel ---- */}
            <div
              className="absolute inset-x-0 top-0 z-10 flex h-10 items-center gap-2 px-2 backdrop-blur-md sm:h-11 sm:px-3"
              style={{
                background: "color-mix(in srgb, var(--m3-surface-container) 82%, transparent)",
              }}
            >
              <img
                src="/zyntrix/svg/zyntrix-app-icon.svg"
                alt=""
                width={28}
                height={28}
                aria-hidden="true"
                className="h-7 w-7 shrink-0"
              />
              <span className="hidden rounded-full bg-[var(--m3-primary-container)] px-3 py-1 text-[11px] font-medium text-[var(--m3-on-primary-container)] sm:block">
                Dolphin
              </span>
              <span className="hidden rounded-full px-2 py-1 text-[11px] text-[var(--m3-on-surface-variant)] sm:block">
                Konsole
              </span>
              <span className="ml-auto flex items-center gap-2.5 text-[var(--m3-on-surface)]">
                <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                <BatteryFull className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums">
                  10:24
                </span>
              </span>
            </div>

            {/* ---- Windows ---- */}
            <div className="absolute inset-x-0 bottom-0 top-10 grid gap-2.5 p-2.5 sm:top-11 sm:gap-3 sm:p-3 md:grid-cols-5">
              {/* Dolphin */}
              <MockWindow
                title="Dolphin — Home"
                className="md:col-span-2"
                actions
              >
                <div className="flex h-full">
                  <div className="w-[86px] shrink-0 space-y-0.5 border-r border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-low)] p-1.5 sm:w-28">
                    {[
                      { icon: Home, label: "Home", active: true },
                      { icon: FileText, label: "Documents" },
                      { icon: ImageIcon, label: "Pictures" },
                      { icon: Download, label: "Downloads" },
                      { icon: Trash2, label: "Trash" },
                    ].map(({ icon: Icon, label, active }) => (
                      <div
                        key={label}
                        className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] sm:text-[11px] ${
                          active
                            ? "bg-[var(--m3-secondary-container)] font-medium text-[var(--m3-on-secondary-container)]"
                            : "text-[var(--m3-on-surface-variant)]"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-1 flex-col bg-[var(--m3-surface)]">
                    <div className="flex items-center gap-1.5 border-b border-[var(--m3-outline-variant)] p-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--m3-surface-container-highest)] text-[10px] text-[var(--m3-on-surface-variant)]">
                        ‹
                      </span>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--m3-surface-container-highest)] text-[10px] text-[var(--m3-on-surface-variant)]">
                        ›
                      </span>
                      <span className="ml-1 flex h-5 flex-1 items-center rounded-full bg-[var(--m3-surface-container-highest)] px-2.5 text-[10px] text-[var(--m3-on-surface-variant)]">
                        /home/m3
                      </span>
                    </div>
                    <div className="grid flex-1 grid-cols-2 content-start gap-1.5 p-2 sm:grid-cols-3">
                      {[
                        { icon: Folder, label: "Design", bg: "var(--m3-primary-container)", fg: "var(--m3-on-primary-container)" },
                        { icon: Music, label: "Music", bg: "var(--m3-tertiary-container)", fg: "var(--m3-on-tertiary-container)" },
                        { icon: ImageIcon, label: "Walls", bg: "var(--m3-secondary-container)", fg: "var(--m3-on-secondary-container)" },
                        { icon: Film, label: "Movies", bg: "var(--m3-primary-container)", fg: "var(--m3-on-primary-container)" },
                        { icon: FileText, label: "Notes", bg: "var(--m3-tertiary-container)", fg: "var(--m3-on-tertiary-container)" },
                      ].map(({ icon: Icon, label, bg, fg }) => (
                        <div
                          key={label}
                          className="flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 transition-transform hover:scale-105"
                          style={{ background: bg, color: fg }}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                          <span className="text-[10px] font-medium">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </MockWindow>

              {/* Konsole */}
              <MockWindow
                title="user@kubuntu: ~"
                className="md:col-span-3"
                actions
              >
                <pre className="m3-scroll h-full overflow-auto whitespace-pre-wrap break-words bg-[var(--m3-surface-container-lowest)] p-2.5 font-mono text-[9px] leading-[1.55] text-[var(--m3-on-surface)] sm:p-3.5 sm:text-[11px]">
                  <span className="text-[var(--m3-primary)] font-medium">m3@kubuntu</span>
                  <span className="text-[var(--m3-on-surface-variant)]">:</span>
                  <span className="text-[var(--m3-tertiary)] font-medium">~</span>
                  <span className="text-[var(--m3-on-surface-variant)]">$ </span>
                  fastfetch{"\n"}
                  <span className="text-[var(--m3-primary)]">        OS</span>{"  Kubuntu 24.04 LTS x86_64"}{"\n"}
                  <span className="text-[var(--m3-secondary)]">    Kernel</span>{"  Linux 6.8.0-45-generic"}{"\n"}
                  <span className="text-[var(--m3-tertiary)]">        DE</span>{"  KDE Plasma (M³ global theme)"}{"\n"}
                  <span className="text-[var(--m3-warning)]">        WM</span>{"  KWin · rounded corners 16px"}{"\n"}
                  <span className="text-[var(--m3-success)]">   Terminal</span>{"  konsole (M3 Kubuntu Dark)"}{"\n"}
                  <span className="text-[var(--m3-on-surface-variant)]">     Theme</span>{"  "}
                  <span style={{ color: "var(--m3-primary)" }}>███</span>{" "}
                  <span style={{ color: "var(--m3-secondary)" }}>███</span>{" "}
                  <span style={{ color: "var(--m3-tertiary)" }}>███</span>{" "}
                  <span style={{ color: "var(--m3-success)" }}>███</span>{" "}
                  <span style={{ color: "var(--m3-warning)" }}>███</span>{" "}
                  <span style={{ color: "var(--m3-error)" }}>███</span>{"\n\n"}
                  <span className="text-[var(--m3-primary)] font-medium">m3@kubuntu</span>
                  <span className="text-[var(--m3-on-surface-variant)]">:</span>
                  <span className="text-[var(--m3-tertiary)] font-medium">~</span>
                  <span className="text-[var(--m3-on-surface-variant)]">$ </span>
                  plasma-apply-colorscheme M3KubuntuDark{"\n"}
                  <span className="text-[var(--m3-success)]">✓ Applied color scheme M3 Kubuntu Dark</span>{"\n\n"}
                  <span className="text-[var(--m3-primary)] font-medium">m3@kubuntu</span>
                  <span className="text-[var(--m3-on-surface-variant)]">:</span>
                  <span className="text-[var(--m3-tertiary)] font-medium">~</span>
                  <span className="text-[var(--m3-on-surface-variant)]">$ </span>
                  <span className="animate-pulse">▌</span>
                </pre>
              </MockWindow>

              {/* System Settings */}
              <MockWindow
                title="System Settings"
                className="hidden md:flex md:col-span-3"
                actions
              >
                <div className="flex h-full">
                  <div className="w-28 shrink-0 space-y-0.5 border-r border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-low)] p-1.5">
                    {[
                      { icon: Palette, label: "Colors", active: true },
                      { icon: ImageIcon, label: "Wallpaper" },
                      { icon: Settings, label: "Fonts" },
                      { icon: Folder, label: "Icons" },
                    ].map(({ icon: Icon, label, active }) => (
                      <div
                        key={label}
                        className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] ${
                          active
                            ? "bg-[var(--m3-secondary-container)] font-medium text-[var(--m3-on-secondary-container)]"
                            : "text-[var(--m3-on-surface-variant)]"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {label}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 space-y-2 overflow-hidden bg-[var(--m3-surface)] p-3">
                    <p className="text-[11px] font-medium text-[var(--m3-on-surface)]">
                      Color schemes
                    </p>
                    {[
                      { name: "M3 Kubuntu Dark", selected: mode === "dark" },
                      { name: "M3 Kubuntu Light", selected: mode === "light" },
                    ].map((s) => (
                      <div
                        key={s.name}
                        className={`flex items-center gap-2.5 rounded-xl border p-2 ${
                          s.selected
                            ? "border-[var(--m3-primary)] bg-[var(--m3-primary-container)]"
                            : "border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)]"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                            s.selected ? "border-[var(--m3-primary)]" : "border-[var(--m3-outline)]"
                          }`}
                        >
                          {s.selected && (
                            <span className="h-2 w-2 rounded-full bg-[var(--m3-primary)]" />
                          )}
                        </span>
                        <div className="flex overflow-hidden rounded-md" aria-hidden="true">
                          <span className="h-5 w-5" style={{ background: "var(--m3-surface)" }} />
                          <span className="h-5 w-5" style={{ background: "var(--m3-primary)" }} />
                          <span className="h-5 w-5" style={{ background: "var(--m3-secondary-container)" }} />
                          <span className="h-5 w-5" style={{ background: "var(--m3-tertiary-container)" }} />
                        </div>
                        <span className="text-[11px] text-[var(--m3-on-surface)]">{s.name}</span>
                        {s.selected && (
                          <span className="ml-auto text-[9px] font-medium uppercase tracking-wide text-[var(--m3-on-primary-container)]">
                            Active
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </MockWindow>

              {/* Material You widget */}
              <div className="hidden md:col-span-2 md:flex md:flex-col md:gap-2.5">
                <div className="flex flex-1 flex-col justify-between rounded-3xl bg-[var(--m3-primary-container)] p-4 text-[var(--m3-on-primary-container)] shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">M³</span>
                    <span className="rounded-full bg-black/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide">
                      Dynamic color
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-snug">
                      Wallpaper colors applied to system
                    </p>
                    <div className="mt-2.5 flex gap-1.5">
                      {["primary", "secondary", "tertiary", "success", "warning", "error"].map(
                        (role) => (
                          <span
                            key={role}
                            className="h-4 w-4 rounded-full border border-black/10"
                            style={{ background: `var(--m3-${role})` }}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-3xl bg-[var(--m3-inverse-surface)] p-3 text-[var(--m3-inverse-on-surface)] shadow-xl">
                  <span className="text-2xl font-light leading-none tabular-nums">10:24</span>
                  <span className="text-[10px] leading-tight opacity-80">
                    Mon, May 12
                    <br />
                    Material clock widget
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockWindow({
  title,
  className,
  children,
  actions,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
  actions?: boolean;
}) {
  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/15 ${className ?? ""}`}
      style={{ background: "var(--m3-surface-container-low)" }}
    >
      <div
        className="flex h-7 shrink-0 items-center gap-1.5 px-3 sm:h-8"
        style={{ background: "var(--m3-surface-container-high)" }}
      >
        <span className="truncate text-[10px] font-medium text-[var(--m3-on-surface)] sm:text-[11px]">
          {title}
        </span>
        {actions && (
          <span className="ml-auto flex items-center gap-2 text-[var(--m3-on-surface-variant)]" aria-hidden="true">
            <span className="h-0.5 w-2.5 rounded-full bg-current opacity-70" />
            <span className="h-2 w-2 rounded-[3px] border border-current opacity-70" />
            <span className="relative flex h-3 w-3 items-center justify-center opacity-70">
              <span className="absolute h-[1.5px] w-3 rotate-45 rounded-full bg-current" />
              <span className="absolute h-[1.5px] w-3 -rotate-45 rounded-full bg-current" />
            </span>
          </span>
        )}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
