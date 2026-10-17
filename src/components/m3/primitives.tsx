"use client";

import { motion, type Variants } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  composeHandlers,
  StateLayer,
  useInteractiveSurface,
} from "./interactive";

type M3Variant = "filled" | "tonal" | "outlined" | "text" | "elevated";
type M3Size = "sm" | "md" | "lg";

export function m3Classes(variant: M3Variant = "filled", size: M3Size = "md") {
  return cn(
    "m3-btn",
    "group",
    `m3-btn-${variant}`,
    size === "sm" && "m3-btn-sm",
    size === "lg" && "m3-btn-lg"
  );
}

export function M3Button({
  variant = "filled",
  size = "md",
  className,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onPointerCancel,
  onPointerDown,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: M3Variant;
  size?: M3Size;
}) {
  const { ref, surfaceProps } = useInteractiveSurface<HTMLButtonElement>();
  return (
    <button
      ref={ref}
      className={cn(m3Classes(variant, size), className)}
      {...composeHandlers(surfaceProps, {
        onPointerEnter,
        onPointerMove,
        onPointerLeave,
        onPointerCancel,
        onPointerDown,
      })}
      {...props}
    >
      <StateLayer />
      {props.children}
    </button>
  );
}

export function M3ButtonLink({
  variant = "filled",
  size = "md",
  className,
  children,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onPointerCancel,
  onPointerDown,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: M3Variant;
  size?: M3Size;
}) {
  const { ref, surfaceProps } = useInteractiveSurface<HTMLAnchorElement>();
  return (
    <a
      ref={ref}
      className={cn(m3Classes(variant, size), className)}
      {...composeHandlers(surfaceProps, {
        onPointerEnter,
        onPointerMove,
        onPointerLeave,
        onPointerCancel,
        onPointerDown,
      })}
      {...props}
    >
      <StateLayer />
      {children}
    </a>
  );
}

/** Scroll-triggered reveal wrapper (fade + rise, once) */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.19, 1, 0.22, 1], // ease-out-expo — enters like film, not slide decks
      }}
    >
      {children}
    </motion.div>
  );
}

/* Shared choreography for SectionHeader — a staggered entrance where the
   eyebrow pops, the title rises, a gradient hairline draws itself, then the
   lead settles. One variants tree; children opt in via `item`. */
const headerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.075, delayChildren: 0.02 },
  },
};
const headerItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.19, 1, 0.22, 1] },
  },
};
const headerEyebrow: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.92 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 380, damping: 26 },
  },
};
const headerRule: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.8, delay: 0.28, ease: [0.19, 1, 0.22, 1] },
  },
};

/** Premium section header: eyebrow pill + display title + lead text */
export function SectionHeader({
  eyebrow,
  title,
  children,
  id,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <motion.div
      variants={headerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-70px" }}
    >
      <motion.span
        variants={headerEyebrow}
        className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)] px-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--m3-primary)]"
      >
        {eyebrow}
      </motion.span>
      <motion.h2
        id={id}
        variants={headerItem}
        className="mt-4 text-balance text-3xl font-medium tracking-tight text-[var(--m3-on-surface)] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]"
      >
        {title}
      </motion.h2>
      {/* gradient hairline — the brand rule that stitches every section */}
      <motion.span
        variants={headerRule}
        aria-hidden="true"
        className="mt-4 block h-[2px] w-16 origin-left rounded-full bg-gradient-to-r from-[var(--m3-primary)] via-[var(--m3-tertiary)] to-transparent"
      />
      <motion.p
        variants={headerItem}
        className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--m3-on-surface-variant)] sm:text-lg"
      >
        {children}
      </motion.p>
    </motion.div>
  );
}

/**
 * Material 3 switch (trailing icon style) with spec-grade press physics:
 * the unchecked thumb GROWS toward the finger while pressed, the checked
 * thumb contracts to reveal the icon, and the release settles on a spring.
 */
export function M3Switch({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label?: string;
}) {
  const { ref, surfaceProps } = useInteractiveSurface<HTMLButtonElement>({
    ripple: false,
  });
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "group relative h-8 w-[52px] shrink-0 rounded-full border-2 transition-[background-color,border-color,box-shadow] duration-300",
        checked
          ? "border-[var(--m3-primary)] bg-[var(--m3-primary)] shadow-[0_2px_10px_color-mix(in_srgb,var(--m3-primary)_45%,transparent)]"
          : "border-[var(--m3-outline)] bg-[var(--m3-surface-container-highest)]"
      )}
      {...surfaceProps}
    >
      <StateLayer className="rounded-full" />
      {/* Thumb glides on transform only — no left/width/height animation */}
      <span
        className={cn(
          "absolute left-1 top-1/2 z-10 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full transition-[transform,background-color] duration-300 [transition-timing-function:var(--ease-spring)]",
          "group-active:duration-150 [transition-property:transform,background-color]",
          checked
            ? "translate-x-[20px] bg-[var(--m3-on-primary)] text-[var(--m3-primary)] group-active:scale-90"
            : "translate-x-0 scale-[0.667] bg-[var(--m3-outline)] group-active:scale-[0.83]"
        )}
      >
        {checked && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 30, delay: 0.04 }}
          >
            <Check className="h-3 w-3" strokeWidth={3.5} aria-hidden="true" />
          </motion.span>
        )}
      </span>
    </button>
  );
}

/** Material 3 chip — pointer-origin state layer + ink press */
export function M3Chip({
  selected,
  icon,
  onClick,
  children,
  ariaLabel,
}: {
  selected?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const { ref, surfaceProps } = useInteractiveSurface<HTMLButtonElement>();
  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-8 items-center gap-1.5 overflow-hidden rounded-lg border px-3 text-sm font-medium transition-[background-color,border-color,color,box-shadow,scale] duration-200 [transition-timing-function:var(--ease-enter)] active:scale-95",
        selected
          ? "border-transparent bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)] shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)]"
          : "border-[var(--m3-outline)] text-[var(--m3-on-surface)] hover:bg-[var(--m3-surface-container)]"
      )}
      {...surfaceProps}
    >
      <StateLayer />
      {selected ? (
        <motion.svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
          initial={false}
          key="check"
        >
          <motion.path
            d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </motion.svg>
      ) : (
        icon
      )}
      {children}
    </button>
  );
}

/** Material 3 FAB — magnetic pull + icon lift on hover + ink press */
export function M3Fab({
  size = "md",
  extended,
  children,
  label,
}: {
  size?: "sm" | "md" | "lg";
  extended?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  const { ref, surfaceProps } = useInteractiveSurface<HTMLButtonElement>({
    magnet: 3,
  });
  return (
    <button
      ref={ref}
      aria-label={label}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] shadow-lg transition-[scale,box-shadow,translate] duration-300 [transition-timing-function:var(--ease-spring)] hover:scale-105 hover:shadow-2xl active:scale-95",
        "[&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:[transition-timing-function:var(--ease-spring)] [&_svg]:group-hover:rotate-[10deg]",
        extended ? "h-14 rounded-2xl px-5 text-base font-medium" : "",
        size === "sm"
          ? "h-10 w-10 rounded-xl"
          : size === "lg"
            ? "h-24 w-24 rounded-[1.75rem]"
            : "h-14 w-14 rounded-2xl"
      )}
      {...surfaceProps}
    >
      <StateLayer />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
}

/**
 * Material 3 radio pair used in the component gallery — a real radiogroup
 * with roving tabindex and arrow-key navigation, animated dot via layoutId.
 */
export function M3RadioPair({
  options,
  value,
  onValueChange,
  label,
}: {
  options: [string, string];
  value: string;
  onValueChange: (v: string) => void;
  label: string;
}) {
  const move = (dir: 1 | -1) => {
    const i = options.indexOf(value);
    const next = options[(i + dir + options.length) % options.length];
    onValueChange(next);
    document
      .getElementById(`demo-radio-${next}`)
      ?.focus({ preventScroll: true });
  };
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex items-center gap-5"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          move(1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          move(-1);
        }
      }}
    >
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            id={`demo-radio-${opt}`}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onValueChange(opt)}
            className="group -m-1 flex items-center gap-3 rounded-full p-1 outline-offset-4 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)]"
          >
            <span
              className={cn(
                "relative grid h-5 w-5 place-items-center rounded-full border-2 transition-[border-color] duration-200",
                active
                  ? "border-[var(--m3-primary)]"
                  : "border-[var(--m3-outline)] group-hover:border-[var(--m3-on-surface)]"
              )}
            >
              {active && (
                <motion.span
                  layoutId="demo-radio-dot"
                  className="h-2.5 w-2.5 rounded-full bg-[var(--m3-primary)]"
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                />
              )}
            </span>
            <span
              className={cn(
                "text-sm transition-colors duration-200",
                active
                  ? "text-[var(--m3-on-surface)]"
                  : "text-[var(--m3-on-surface-variant)] group-hover:text-[var(--m3-on-surface)]"
              )}
            >
              {opt}
            </span>
          </button>
        );
      })}
    </div>
  );
}
