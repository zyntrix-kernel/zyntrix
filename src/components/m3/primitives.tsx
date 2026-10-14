import { cn } from "@/lib/utils";

type M3Variant = "filled" | "tonal" | "outlined" | "text" | "elevated";
type M3Size = "sm" | "md" | "lg";

export function m3Classes(variant: M3Variant = "filled", size: M3Size = "md") {
  return cn(
    "m3-btn",
    `m3-btn-${variant}`,
    size === "sm" && "m3-btn-sm",
    size === "lg" && "m3-btn-lg"
  );
}

export function M3Button({
  variant = "filled",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: M3Variant;
  size?: M3Size;
}) {
  return (
    <button className={cn(m3Classes(variant, size), className)} {...props}>
      {props.children}
    </button>
  );
}

export function M3ButtonLink({
  variant = "filled",
  size = "md",
  className,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: M3Variant;
  size?: M3Size;
}) {
  return (
    <a className={cn(m3Classes(variant, size), className)} {...props}>
      {children}
    </a>
  );
}

/** Material 3 switch (trailing icon style) */
export function M3Switch({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={`relative h-8 w-[52px] shrink-0 rounded-full border-2 transition-colors duration-200 ${
        checked
          ? "border-[var(--m3-primary)] bg-[var(--m3-primary)]"
          : "border-[var(--m3-outline)] bg-[var(--m3-surface-container-highest)]"
      }`}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-200 ${
          checked
            ? "left-[22px] h-6 w-6 bg-[var(--m3-on-primary)]"
            : "left-1 h-4 w-4 bg-[var(--m3-outline)]"
        }`}
      />
    </button>
  );
}

/** Material 3 chip */
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
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors ${
        selected
          ? "border-transparent bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)]"
          : "border-[var(--m3-outline)] text-[var(--m3-on-surface)] hover:bg-[var(--m3-surface-container)]"
      }`}
    >
      {selected ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      ) : (
        icon
      )}
      {children}
    </button>
  );
}

/** Material 3 FAB */
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
  return (
    <button
      aria-label={label}
      className={`inline-flex items-center justify-center gap-2 bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] shadow-lg transition-transform hover:scale-105 active:scale-95 ${
        extended ? "h-14 rounded-2xl px-5 text-base font-medium" : ""
      } ${
        size === "sm"
          ? "h-10 w-10 rounded-xl"
          : size === "lg"
            ? "h-24 w-24 rounded-[1.75rem]"
            : "h-14 w-14 rounded-2xl"
      }`}
    >
      {children}
    </button>
  );
}
