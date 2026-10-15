"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Moon, Sun } from "lucide-react";
import { M3ButtonLink } from "./primitives";
import { cn } from "@/lib/utils";
import type { M3Mode } from "@/lib/m3/theme";

const NAV = [
  { href: "#preview", label: "Preview" },
  { href: "#palette", label: "Palette" },
  { href: "#components", label: "Components" },
  { href: "#download", label: "Download" },
  { href: "#install", label: "Install" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function TopBar({
  mode,
  onToggleMode,
}: {
  mode: M3Mode;
  onToggleMode: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: the section crossing the viewport reading band (40% from the
  // top) is active; null while above the first section, so the pill rests.
  useEffect(() => {
    const sections = NAV.map((item) =>
      document.getElementById(item.href.slice(1))
    ).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const intersecting = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target.id);
          else intersecting.delete(entry.target.id);
        }
        const topMost = sections.find((section) =>
          intersecting.has(section.id)
        );
        setActiveId(topMost ? topMost.id : null);
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-3 z-50 px-3 sm:top-4">
      <nav
        aria-label="Main navigation"
        className={cn(
          "mx-auto flex h-14 max-w-6xl items-center gap-2 rounded-full border pl-4 pr-2 backdrop-blur-xl [-webkit-backdrop-filter:blur(24px)_saturate(1.5)] transition-[background-color,border-color,box-shadow] duration-500 sm:h-16 sm:pl-6 sm:pr-3",
          scrolled
            ? "border-[var(--m3-outline-variant)] bg-[color-mix(in_srgb,var(--m3-surface-container)_78%,transparent)] shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
            : "border-transparent bg-[color-mix(in_srgb,var(--m3-surface-container)_92%,transparent)] shadow-md"
        )}
      >
        <a
          href="#top"
          className="group flex items-center gap-2.5 rounded-full py-1 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2"
          aria-label="Zyntrix home"
        >
          <img
            src="/zyntrix/svg/zyntrix-app-icon.svg"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 drop-shadow-sm transition-transform duration-500 [transition-timing-function:var(--ease-spring)] group-hover:scale-110 group-hover:-rotate-3"
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
          {NAV.map((item) => {
            const active = activeId === item.href.slice(1);
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2",
                    active
                      ? "text-[var(--m3-on-secondary-container)]"
                      : "text-[var(--m3-on-surface-variant)] hover:bg-[var(--m3-secondary-container)] hover:text-[var(--m3-on-secondary-container)]"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="topbar-nav-pill"
                      className="absolute inset-0 rounded-full bg-[var(--m3-secondary-container)]"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button
            type="button"
            onClick={onToggleMode}
            aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
            className="relative grid h-10 w-10 place-items-center rounded-full text-[var(--m3-on-surface-variant)] transition-[background-color,color,transform] duration-300 [transition-timing-function:var(--ease-spring)] hover:scale-105 hover:bg-[var(--m3-secondary-container)] hover:text-[var(--m3-on-secondary-container)] active:scale-95 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={mode}
                className="grid place-items-center"
                initial={{ opacity: 0, rotate: -70, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 70, scale: 0.6 }}
                transition={{ duration: 0.22, ease: EASE }}
              >
                {mode === "dark" ? (
                  <Sun className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Moon className="h-5 w-5" aria-hidden="true" />
                )}
              </motion.span>
            </AnimatePresence>
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
