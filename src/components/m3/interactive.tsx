"use client";

/* ==================================================================
   PEAK MICROINTERACTION ENGINE
   One vocabulary for every interactive surface in the studio:

   1. Pointer-origin state layer — the M3 "state layer" that blooms
      from the exact point the cursor entered (--sl-x/--sl-y/--sl-o).
   2. Magnetism — the surface leans toward the cursor (±N px) via the
      individual `translate` property, composing with press `scale`.
   3. Ink ripple — transform-only ripple spawned on press, prepended
      so it always paints beneath the label.

   Hot-path discipline: passive listeners, rAF-coalesced writes,
   direct CSS-var/style writes. ZERO React renders while tracking.
   Every effect is gated to (hover:hover + pointer:fine) and fully
   disabled under prefers-reduced-motion.
   ================================================================== */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

let fineQuery: MediaQueryList | null = null;
let reducedQuery: MediaQueryList | null = null;

function queries() {
  if (typeof window === "undefined") return null;
  fineQuery ??= window.matchMedia(FINE_POINTER);
  reducedQuery ??= window.matchMedia(REDUCED_MOTION);
  return { fine: fineQuery, reduced: reducedQuery };
}

/** State-layer bloom origin + magnetism are mouse/trackpad luxuries. */
export function canTrackPointers(): boolean {
  const q = queries();
  return !!q && q.fine.matches && !q.reduced.matches;
}

/** Ink ripples are authentic Material on EVERY pointer — touch included.
 *  Only reduced-motion suppresses them. */
export function canRipple(): boolean {
  const q = queries();
  return !!q && !q.reduced.matches;
}

/* ------------------------------ ripple ------------------------------ */

const MAX_INKS = 2;

/** Transform-only ink ripple; prepended so ink paints beneath content. */
function spawnInk(el: HTMLElement, offsetX: number, offsetY: number) {
  const rect = el.getBoundingClientRect();
  const d = Math.max(rect.width, rect.height) * 2.1;
  // Keep the burst bounded — older inks yield to the newest press.
  while (el.querySelectorAll(":scope > .ripple-ink").length >= MAX_INKS) {
    el.querySelector(":scope > .ripple-ink")?.remove();
  }
  const ink = document.createElement("span");
  ink.className = "ripple-ink";
  ink.setAttribute("aria-hidden", "true");
  ink.style.width = ink.style.height = `${d}px`;
  ink.style.left = `${offsetX - d / 2}px`;
  ink.style.top = `${offsetY - d / 2}px`;
  ink.addEventListener("animationend", () => ink.remove(), { once: true });
  el.prepend(ink);
}

/* --------------------------- surface hook --------------------------- */

export interface SurfaceOptions {
  /** Magnetic pull amplitude in px. 0 (default) = static surface. */
  magnet?: number;
  /** Spawn ink ripples on press (default true). */
  ripple?: boolean;
  /** Radius of the state-layer bloom in px (default 150). */
  bloomRadius?: number;
}

export interface SurfaceProps {
  onPointerEnter: (e: ReactPointerEvent) => void;
  onPointerMove: (e: ReactPointerEvent) => void;
  onPointerLeave: (e: ReactPointerEvent) => void;
  onPointerCancel: (e: ReactPointerEvent) => void;
  onPointerDown: (e: ReactPointerEvent) => void;
  style: CSSProperties;
}

interface SurfaceState {
  raf: 0 | number;
  px: number;
  py: number;
  rect: DOMRect | null;
  hovered: boolean;
}

/**
 * Attaches the full microinteraction vocabulary to any element.
 * The element should carry `.state-layer` (and `overflow:hidden` when
 * the layer must clip to its shape). Returns a ref + spreadable props.
 */
export function useInteractiveSurface<S extends HTMLElement = HTMLButtonElement>(
  options: SurfaceOptions = {}
): { ref: RefObject<S | null>; surfaceProps: SurfaceProps } {
  const { magnet = 0, ripple = true, bloomRadius } = options;
  const ref = useRef<S | null>(null);
  const st = useRef<SurfaceState>({
    raf: 0,
    px: 0,
    py: 0,
    rect: null,
    hovered: false,
  });

  const flush = useCallback(() => {
    const el = ref.current;
    const s = st.current;
    s.raf = 0;
    if (!el) return;
    el.style.setProperty("--sl-x", `${s.px}px`);
    el.style.setProperty("--sl-y", `${s.py}px`);
    if (magnet > 0 && s.rect) {
      const dx = (s.px - s.rect.width / 2) / (s.rect.width / 2);
      const dy = (s.py - s.rect.height / 2) / (s.rect.height / 2);
      el.style.translate = `${(dx * magnet).toFixed(2)}px ${(dy * magnet).toFixed(2)}px`;
    }
  }, [magnet]);

  const schedule = useCallback(() => {
    const s = st.current;
    if (!s.raf) s.raf = requestAnimationFrame(flush);
  }, [flush]);

  const localPoint = useCallback(
    (clientX: number, clientY: number) => {
      const el = ref.current;
      const s = st.current;
      if (!el) return null;
      if (!s.rect) s.rect = el.getBoundingClientRect();
      return { x: clientX - s.rect.left, y: clientY - s.rect.top };
    },
    []
  );

  const onPointerEnter = useCallback(
    (e: ReactPointerEvent) => {
      if (!canTrackPointers()) return;
      const el = ref.current;
      const s = st.current;
      if (!el) return;
      s.hovered = true;
      s.rect = el.getBoundingClientRect();
      if (bloomRadius) el.style.setProperty("--sl-r", `${bloomRadius}px`);
      el.style.setProperty("--sl-o", "1");
      const p = localPoint(e.clientX, e.clientY);
      if (p) {
        s.px = p.x;
        s.py = p.y;
        schedule();
      }
    },
    [bloomRadius, localPoint, schedule]
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      const s = st.current;
      if (!s.hovered || !canTrackPointers()) return;
      const p = localPoint(e.clientX, e.clientY);
      if (!p) return;
      s.px = p.x;
      s.py = p.y;
      schedule();
    },
    [localPoint, schedule]
  );

  const settle = useCallback(() => {
    const el = ref.current;
    const s = st.current;
    s.hovered = false;
    if (s.raf) {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    }
    if (!el) return;
    el.style.setProperty("--sl-o", "0");
    if (magnet > 0) el.style.translate = ""; // clear; classes stay authoritative
    s.rect = null;
  }, [magnet]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (!canRipple() || !ripple) return;
      const el = ref.current;
      if (!el) return;
      const p = localPoint(e.clientX, e.clientY);
      if (p) spawnInk(el, p.x, p.y);
    },
    [localPoint, ripple]
  );

  // Press deepens the state layer; release returns it to hover level.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const deepen = () => {
      if (st.current.hovered) el.style.setProperty("--sl-o", "1.5");
    };
    const restore = () => {
      if (st.current.hovered) el.style.setProperty("--sl-o", "1");
    };
    el.addEventListener("pointerdown", deepen);
    window.addEventListener("pointerup", restore);
    window.addEventListener("pointercancel", restore);
    // Scrolling while hovered invalidates the cached rect.
    const invalidate = () => {
      st.current.rect = null;
    };
    window.addEventListener("scroll", invalidate, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", deepen);
      window.removeEventListener("pointerup", restore);
      window.removeEventListener("pointercancel", restore);
      window.removeEventListener("scroll", invalidate);
      if (st.current.raf) cancelAnimationFrame(st.current.raf);
    };
  }, []);

  return {
    ref,
    surfaceProps: {
      onPointerEnter,
      onPointerMove,
      onPointerLeave: settle,
      onPointerCancel: settle,
      onPointerDown,
      style: {} as CSSProperties,
    },
  };
}

/** Merge surface handlers with consumer handlers — nothing gets dropped. */
type HandlerMap = Record<string, unknown>;
export function composeHandlers(
  surface: SurfaceProps,
  own?: HandlerMap
): SurfaceProps {
  if (!own) return surface;
  const merged = { ...surface, style: { ...surface.style, ...(own.style as CSSProperties) } } as HandlerMap & typeof surface;
  for (const key of Object.keys(surface)) {
    const a = surface[key as keyof SurfaceProps];
    const b = own[key];
    if (typeof a === "function" && typeof b === "function") {
      (merged as Record<string, unknown>)[key] = (...args: unknown[]) => {
        (a as (...a2: unknown[]) => void)(...args);
        (b as (...a2: unknown[]) => void)(...args);
      };
    }
  }
  return merged as SurfaceProps;
}

/* ---------------------------- state layer ---------------------------- */

/** M3 state layer — paints from the pointer-enter origin. */
export function StateLayer({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("state-layer", className)} />;
}

/* ---------------------------- copy feedback ---------------------------- */

/** Check/copy icon morph used by every copy affordance. */
export function CopySwap({
  done,
  className,
  size = "h-4 w-4",
}: {
  done: boolean;
  className?: string;
  size?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative grid place-items-center", size, className)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={done ? "check" : "copy"}
          className="absolute inset-0 grid place-items-center"
          initial={{ scale: 0.3, opacity: 0, rotate: done ? -30 : 30 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.3, opacity: 0, rotate: done ? 30 : -30 }}
          transition={{ type: "spring", stiffness: 520, damping: 30 }}
        >
          {done ? (
            <Check className={cn(size, "stroke-[2.5]")} />
          ) : (
            <Copy className={size} />
          )}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Clipboard with flash state + toast, shared by all copy surfaces. */
export function useCopyFlash(prefix = "Copied to clipboard") {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const copy = useCallback(
    async (id: string, text: string, description?: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(id);
        toast({ title: prefix, description: description ?? text });
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(null), 1600);
        return true;
      } catch {
        toast({ title: "Copy failed", description: "Clipboard unavailable" });
        return false;
      }
    },
    [prefix, toast]
  );

  return { copied, copy };
}

/* ------------------------------ tooltip ------------------------------ */

/**
 * MicroTip — a spring-loaded tooltip that follows its anchor.
 * Decorative (aria-hidden): triggers must carry their own labels.
 */
export function Tipped({
  tip,
  children,
  className,
  gap = 10,
  side = "bottom",
}: {
  tip: ReactNode;
  children: ReactNode;
  className?: string;
  gap?: number;
  side?: "top" | "bottom";
}) {
  const anchor = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);
  const [portaled, setPortaled] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const show = useCallback(() => {
    const r = anchor.current?.getBoundingClientRect();
    if (r) {
      setPos({
        x: r.left + r.width / 2,
        y: side === "top" ? r.top - gap : r.bottom + gap,
      });
    }
    setPortaled(true);
    setOpen(true);
  }, [gap, side]);

  return (
    <span
      ref={anchor}
      className={cn("relative inline-flex", className)}
      onPointerEnter={show}
      onPointerLeave={() => setOpen(false)}
      onFocus={show}
      onBlur={() => setOpen(false)}
    >
      {children}
      {portaled &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.span
                aria-hidden="true"
                className="pointer-events-none fixed z-[95] whitespace-nowrap rounded-lg bg-[var(--m3-inverse-surface)] px-2.5 py-1 text-[11px] font-medium tracking-wide text-[var(--m3-inverse-on-surface)] shadow-[0_4px_18px_rgba(0,0,0,0.35)]"
                style={{
                  left: pos.x,
                  top: pos.y,
                  transform:
                    side === "top"
                      ? "translate(-50%, -100%)"
                      : "translate(-50%, 0)",
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                {tip}
              </motion.span>
            )}
          </AnimatePresence>,
          document.body
        )}
    </span>
  );
}
