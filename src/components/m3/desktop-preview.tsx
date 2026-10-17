"use client";

import { useEffect, useRef, useState } from "react";
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

/* ------------------------------------------------------------------ */
/*  Draggable Plasma desktop (md+)                                     */
/*                                                                     */
/*  The mock windows are real windows now: grab a title bar and move   */
/*  them anywhere on the desktop. The drag pipeline is built so the    */
/*  page itself never reacts — no text selection, no native image      */
/*  drag, no scroll-to-top, no history spam:                           */
/*   • pointer capture on the title bar (moves keep streaming even     */
/*     when the pointer leaves the element)                            */
/*   • pointerdown preventDefault + html.window-dragging user-select   */
/*     lock kill selection auto-scroll (the "cursor flies to top" bug) */
/*   • transform-only visual updates, committed to layout once         */
/*   • arrow-key + Home keyboard equivalent for the same actions       */
/* ------------------------------------------------------------------ */

type WinId = "dolphin" | "konsole" | "settings";

interface WinGeom {
  /** position + size as fractions of the desktop canvas */
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
}

const DEFAULT_GEOM: Record<WinId, Omit<WinGeom, "z">> = {
  dolphin: { x: 0.025, y: 0.07, w: 0.34, h: 0.58 },
  konsole: { x: 0.28, y: 0.3, w: 0.5, h: 0.6 },
  settings: { x: 0.6, y: 0.06, w: 0.375, h: 0.52 },
};

const WINDOWS: { id: WinId; title: string; label: string }[] = [
  { id: "dolphin", title: "Dolphin — Home", label: "Dolphin" },
  { id: "konsole", title: "user@kubuntu: ~", label: "Konsole" },
  { id: "settings", title: "System Settings", label: "System Settings" },
];

const initialGeoms = (): Record<WinId, WinGeom> => ({
  dolphin: { ...DEFAULT_GEOM.dolphin, z: 10 },
  konsole: { ...DEFAULT_GEOM.konsole, z: 30 },
  settings: { ...DEFAULT_GEOM.settings, z: 20 },
});

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* ----------------------------- contents ---------------------------- */

function SideEntry({
  icon: Icon,
  label,
  active,
}: {
  icon: typeof Folder;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] sm:text-[11px] ${
        active
          ? "bg-[var(--m3-secondary-container)] font-medium text-[var(--m3-on-secondary-container)]"
          : "text-[var(--m3-on-surface-variant)]"
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </div>
  );
}

function DolphinContent() {
  return (
    <div className="flex h-full">
      <div className="w-[86px] shrink-0 space-y-0.5 border-r border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-low)] p-1.5 sm:w-28">
        {[
          { icon: Home, label: "Home", active: true },
          { icon: FileText, label: "Documents" },
          { icon: ImageIcon, label: "Pictures" },
          { icon: Download, label: "Downloads" },
          { icon: Trash2, label: "Trash" },
        ].map(({ icon: Icon, label, active }) => (
          <SideEntry key={label} icon={Icon} label={label} active={active} />
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
  );
}

function KonsoleContent() {
  return (
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
  );
}

function SettingsContent({ mode }: { mode: M3Mode }) {
  return (
    <div className="flex h-full">
      <div className="w-28 shrink-0 space-y-0.5 border-r border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-low)] p-1.5">
        {[
          { icon: Palette, label: "Colors", active: true },
          { icon: ImageIcon, label: "Wallpaper" },
          { icon: Settings, label: "Fonts" },
          { icon: Folder, label: "Icons" },
        ].map(({ icon: Icon, label, active }) => (
          <SideEntry key={label} icon={Icon} label={label} active={active} />
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
  );
}

function DesktopWidgets() {
  return (
    <div className="pointer-events-none absolute bottom-[3.5%] right-[2.5%] z-0 flex w-[24%] flex-col gap-2.5">
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
  );
}

/* ----------------------------- windows ----------------------------- */

function WindowChrome({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        className="flex h-7 shrink-0 items-center gap-1.5 px-3 sm:h-8"
        style={{ background: "var(--m3-surface-container-high)" }}
      >
        <span className="truncate text-[10px] font-medium text-[var(--m3-on-surface)] sm:text-[11px]">
          {title}
        </span>
        <span
          className="ml-auto flex items-center gap-2 text-[var(--m3-on-surface-variant)]"
          aria-hidden="true"
        >
          <span className="h-0.5 w-2.5 rounded-full bg-current opacity-70" />
          <span className="h-2 w-2 rounded-[3px] border border-current opacity-70" />
          <span className="relative flex h-3 w-3 items-center justify-center opacity-70">
            <span className="absolute h-[1.5px] w-3 rotate-45 rounded-full bg-current" />
            <span className="absolute h-[1.5px] w-3 -rotate-45 rounded-full bg-current" />
          </span>
        </span>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </>
  );
}

/** Static window for the stacked small-screen layout (dragging is a
 *  fine-pointer interaction; touch keeps the tidy grid). */
function StaticWindow({
  title,
  minHeight,
  children,
}: {
  title: string;
  minHeight: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-0 flex-col overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/15"
      style={{ background: "var(--m3-surface-container-low)", minHeight }}
    >
      <WindowChrome title={title}>{children}</WindowChrome>
    </div>
  );
}

/** Keep the title bar reachable: allow pushing a window partially out of
 *  the canvas but never further than 92% of its own size. */
function clampGeom(g: Omit<WinGeom, "z">): Omit<WinGeom, "z"> {
  return {
    ...g,
    x: clamp(g.x, -g.w + 0.08, 1 - 0.08),
    y: clamp(g.y, 0, 1 - 0.08),
  };
}

interface DragRef {
  id: WinId;
  pointerId: number;
  startX: number;
  startY: number;
  /** last known-good pointer position — pointercancel events carry 0,0
   *  coords, so commits must never read clientX/Y off the end event */
  lastX: number;
  lastY: number;
  origin: Omit<WinGeom, "z">;
}

export function DesktopPreview({ mode }: { mode: M3Mode }) {
  // Component is remounted on mode change (keyed by parent), so this only
  // initializes the default wallpaper for the current mode.
  const [wall, setWall] = useState<WallId>(mode === "dark" ? "dark" : "light");

  const [geoms, setGeoms] = useState<Record<WinId, WinGeom>>(initialGeoms);
  const [draggingId, setDraggingId] = useState<WinId | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const winEls = useRef<Partial<Record<WinId, HTMLDivElement | null>>>({});
  const dragRef = useRef<DragRef | null>(null);
  const rafRef = useRef(0);
  const zRef = useRef(31);

  const bringToFront = (id: WinId) => {
    zRef.current += 1;
    const z = zRef.current;
    setGeoms((prev) => (prev[id].z === z ? prev : { ...prev, [id]: { ...prev[id], z } }));
  };

  const setGeom = (id: WinId, g: Omit<WinGeom, "z">) =>
    setGeoms((prev) => ({ ...prev, [id]: { ...prev[id], ...clampGeom(g) } }));

  /* ---------------- pointer drag pipeline ---------------- */

  const beginDrag = (id: WinId, e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    // Kill text-selection auto-scroll and native drag at the root — this is
    // what previously sent the cursor/selection flying to the top of the page.
    e.preventDefault();
    const winEl = winEls.current[id];
    if (!winEl) return;
    // Canceling pointerdown also suppresses the click-focus, so focus the
    // handle here — preventScroll keeps focus from ever moving the page.
    e.currentTarget.focus({ preventScroll: true });
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture is best-effort; handlers still work while the pointer stays */
    }
    dragRef.current = {
      id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      origin: { x: geoms[id].x, y: geoms[id].y, w: geoms[id].w, h: geoms[id].h },
    };
    setDraggingId(id);
    bringToFront(id);
    document.documentElement.classList.add("window-dragging");
  };

  const moveDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    d.lastX = e.clientX;
    d.lastY = e.clientY;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    // Transform-only preview; layout commits once on release. Coalesced to
    // one write per frame so high-frequency events never thrash style.
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const el = winEls.current[d.id];
      if (el) el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    });
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    dragRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    const el = winEls.current[d.id];
    const canvas = canvasRef.current;
    // Commit from the last known-good pointer position: pointercancel (which
    // can fire with 0,0 coords when e.g. a context menu takes over) must
    // never teleport the window toward the top-left corner.
    const dx = d.lastX - d.startX;
    const dy = d.lastY - d.startY;
    if (el) el.style.transform = "";
    if (canvas && (dx !== 0 || dy !== 0)) {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setGeom(d.id, {
          x: d.origin.x + dx / rect.width,
          y: d.origin.y + dy / rect.height,
          w: d.origin.w,
          h: d.origin.h,
        });
      }
    }
    setDraggingId(null);
    document.documentElement.classList.remove("window-dragging");
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.documentElement.classList.remove("window-dragging");
    };
  }, []);

  /* ---------------- keyboard move (a11y parity) ---------------- */

  const moveByKeyboard = (id: WinId, e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 0.08 : 0.02;
    const g = geoms[id];
    switch (e.key) {
      case "ArrowLeft":
        setGeom(id, { ...g, x: g.x - step });
        break;
      case "ArrowRight":
        setGeom(id, { ...g, x: g.x + step });
        break;
      case "ArrowUp":
        setGeom(id, { ...g, y: g.y - step });
        break;
      case "ArrowDown":
        setGeom(id, { ...g, y: g.y + step });
        break;
      case "Home":
        setGeom(id, DEFAULT_GEOM[id]);
        break;
      default:
        return;
    }
    e.preventDefault();
    bringToFront(id);
  };

  /* ---------------- render ---------------- */

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
          your seed color. Grab a window&apos;s title bar to rearrange the
          desktop; arrow keys work too.
        </SectionHeader>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Choose preview wallpaper" className="flex gap-2">
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
        </div>

        <div className="relative mt-8 overflow-hidden rounded-[28px] shadow-2xl ring-1 ring-black/20">
          {/* Wallpaper — all three stacked and preloaded, crossfaded via opacity */}
          {WALLPAPERS.map((w) => (
            <img
              key={w.id}
              src={w.src}
              alt={`Material 3 ${w.label} wallpaper`}
              aria-hidden={wall !== w.id ? true : undefined}
              draggable={false}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 [transition-timing-function:var(--ease-enter)] ${
                wall === w.id ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          <div className="relative aspect-[16/11] md:aspect-[16/9]">
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
                draggable={false}
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

            {/* ---- Small screens: calm stacked grid ---- */}
            <div className="absolute inset-x-0 bottom-0 top-10 grid gap-2.5 p-2.5 sm:top-11 md:hidden">
              <StaticWindow title="Dolphin — Home" minHeight={0}>
                <DolphinContent />
              </StaticWindow>
              <StaticWindow title="user@kubuntu: ~" minHeight={0}>
                <KonsoleContent />
              </StaticWindow>
            </div>

            {/* ---- md+: real draggable desktop (always mounted — CSS picks
                 the layout, so hydration and first paint agree) ---- */}
            <div
              ref={canvasRef}
              className="absolute inset-x-0 bottom-0 top-10 hidden sm:top-11 md:block"
              role="group"
              aria-label="Plasma desktop — windows are draggable"
            >
              <DesktopWidgets />
              {WINDOWS.map(({ id, title, label }) => {
                    const g = geoms[id];
                    const isDragging = draggingId === id;
                    return (
                      <div
                        key={id}
                        ref={(el) => {
                          winEls.current[id] = el;
                        }}
                        onDragStart={(e) => e.preventDefault()}
                        className={`absolute flex min-h-0 flex-col overflow-hidden rounded-2xl ring-1 ring-black/15 ${
                          isDragging
                            ? "shadow-[0_24px_70px_-12px_rgba(0,0,0,0.65)]"
                            : "shadow-xl"
                        }`}
                        style={{
                          background: "var(--m3-surface-container-low)",
                          left: `${g.x * 100}%`,
                          top: `${g.y * 100}%`,
                          width: `${g.w * 100}%`,
                          height: `${g.h * 100}%`,
                          zIndex: g.z,
                          willChange: isDragging ? "transform" : undefined,
                        }}
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label={`${label} window — drag to move, or use arrow keys (Shift for larger steps), Home to reset`}
                          onPointerDown={(e) => beginDrag(id, e)}
                          onPointerMove={moveDrag}
                          onPointerUp={endDrag}
                          onPointerCancel={endDrag}
                          onLostPointerCapture={endDrag}
                          onKeyDown={(e) => moveByKeyboard(id, e)}
                          onFocus={() => bringToFront(id)}
                          className={`flex h-7 shrink-0 touch-none items-center gap-1.5 px-3 outline-offset-[-2px] sm:h-8 ${
                            isDragging ? "cursor-grabbing" : "cursor-grab"
                          }`}
                          style={{ background: "var(--m3-surface-container-high)" }}
                        >
                          <span className="truncate text-[10px] font-medium text-[var(--m3-on-surface)] sm:text-[11px]">
                            {title}
                          </span>
                          <span
                            className="ml-auto flex items-center gap-2 text-[var(--m3-on-surface-variant)]"
                            aria-hidden="true"
                          >
                            <span className="h-0.5 w-2.5 rounded-full bg-current opacity-70" />
                            <span className="h-2 w-2 rounded-[3px] border border-current opacity-70" />
                            <span className="relative flex h-3 w-3 items-center justify-center opacity-70">
                              <span className="absolute h-[1.5px] w-3 rotate-45 rounded-full bg-current" />
                              <span className="absolute h-[1.5px] w-3 -rotate-45 rounded-full bg-current" />
                            </span>
                          </span>
                        </div>
                        <div className="min-h-0 flex-1">
                          {id === "dolphin" && <DolphinContent />}
                          {id === "konsole" && <KonsoleContent />}
                          {id === "settings" && <SettingsContent mode={mode} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
          </div>
        </div>
      </div>
    </section>
  );
}
