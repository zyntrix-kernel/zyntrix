export function Footer() {
  return (
    <footer className="mt-auto bg-[var(--m3-surface-container)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--m3-primary)] text-sm font-bold text-[var(--m3-on-primary)]"
          >
            M³
          </span>
          <div>
            <p className="text-sm font-medium text-[var(--m3-on-surface)]">
              M³ Kubuntu — Material 3 Theme Studio
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
            ].map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  className="rounded-full px-3 py-2 transition-colors hover:bg-[var(--m3-secondary-container)] hover:text-[var(--m3-on-secondary-container)]"
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
