import type { M3Mode } from "@/lib/m3/theme";

export function Footer({ mode }: { mode: M3Mode }) {
  return (
    <footer className="mt-auto border-t border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <div className="flex items-center gap-3">
          <img
            src={
              mode === "dark"
                ? "/zyntrix/svg/zyntrix-symbol.svg"
                : "/zyntrix/svg/zyntrix-symbol-light.svg"
            }
            alt="Zyntrix logo"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0"
          />
          <div>
            <p className="text-sm font-medium text-[var(--m3-on-surface)]">
              Zyntrix — Material 3 Theme Studio for Kubuntu
            </p>
            <p className="text-xs text-[var(--m3-on-surface-variant)]">
              Not affiliated with Google or Canonical. Colors via the Apache-2.0
              material-color-utilities engine.
            </p>
          </div>
        </div>
        <nav aria-label="Footer navigation">
          <ul className="flex items-center gap-1 text-sm font-medium text-[var(--m3-on-surface-variant)]">
            {[
              ["#preview", "Preview"],
              ["#download", "Download"],
              ["#install", "Install"],
              ["/zyntrix/", "Brand kit"],
            ].map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  className="relative rounded-full px-3 py-2 transition-colors after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:[transition-timing-function:var(--ease-enter)] hover:bg-[var(--m3-secondary-container)] hover:text-[var(--m3-on-secondary-container)] hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2 focus-visible:after:scale-x-100"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
