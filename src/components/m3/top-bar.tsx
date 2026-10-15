import { Download, Moon, Sun } from "lucide-react";
import { M3ButtonLink } from "./primitives";
import type { M3Mode } from "@/lib/m3/theme";

const NAV = [
  { href: "#preview", label: "Preview" },
  { href: "#palette", label: "Palette" },
  { href: "#components", label: "Components" },
  { href: "#download", label: "Download" },
  { href: "#install", label: "Install" },
];

export function TopBar({
  mode,
  onToggleMode,
}: {
  mode: M3Mode;
  onToggleMode: () => void;
}) {
  return (
    <header className="sticky top-3 z-50 px-3 sm:top-4">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-14 max-w-6xl items-center gap-2 rounded-full bg-[var(--m3-surface-container)] pl-4 pr-2 shadow-md sm:h-16 sm:pl-6 sm:pr-3"
      >
        <a
          href="#top"
          className="flex items-center gap-2.5 rounded-full py-1 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)]"
          aria-label="Zyntrix home"
        >
          <img
            src="/zyntrix/svg/zyntrix-app-icon.svg"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 drop-shadow-sm"
            aria-hidden="true"
          />
          <span className="hidden leading-tight sm:block">
            <span className="block text-base font-medium text-[var(--m3-on-surface)]">
              Zyntrix
            </span>
            <span className="block text-[11px] text-[var(--m3-on-surface-variant)]">
              M³ for Kubuntu
            </span>
          </span>
        </a>

        <ul className="mx-auto hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--m3-on-surface-variant)] transition-colors hover:bg-[var(--m3-secondary-container)] hover:text-[var(--m3-on-secondary-container)]"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button
            type="button"
            onClick={onToggleMode}
            aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--m3-on-surface-variant)] transition-colors hover:bg-[var(--m3-secondary-container)] hover:text-[var(--m3-on-secondary-container)]"
          >
            {mode === "dark" ? (
              <Sun className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
          <M3ButtonLink
            href="#download"
            size="sm"
            className="h-10 px-4"
            aria-label="Download the theme package"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Get theme</span>
          </M3ButtonLink>
        </div>
      </nav>
    </header>
  );
}
