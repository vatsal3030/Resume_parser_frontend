"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/**
 * ThemeToggle — Claude-style subtle theme switcher
 * Smoothly switches between Dark (Claude deep charcoal) and Light (warm cream)
 */
export function ThemeToggle({ className = "" }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl border border-(--hairline) bg-(--surface-soft) ${className}`} />
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = (e) => {
    const nextTheme = isDark ? "light" : "dark";

    // If View Transitions API is not available or user prefers reduced motion, switch normally
    if (
      typeof document === "undefined" ||
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(nextTheme);
      return;
    }

    // Origin of the wave: top right corner towards bottom left corner
    const rect = e?.currentTarget?.getBoundingClientRect?.();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth;
    const y = rect ? rect.top + rect.height / 2 : 0;

    // Farthest distance from (x, y) to viewport edges (bottom-left corner)
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];

      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 600,
          easing: "cubic-bezier(0.25, 1, 0.5, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`relative w-9 h-9 rounded-xl border border-(--hairline) bg-(--surface-soft) hover:bg-(--surface-card) hover:border-(--muted-soft) transition-all duration-200 flex items-center justify-center text-(--muted) hover:text-(--ink) cursor-pointer group active:scale-95 ${className}`}
      title={isDark ? "Switch to Light theme" : "Switch to Dark theme"}
      aria-label="Toggle theme"
    >
      <div className="relative w-4 h-4">
        <Sun
          className={`w-4 h-4 absolute inset-0 transition-all duration-300 ${
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100 text-amber-500"
          }`}
        />
        <Moon
          className={`w-4 h-4 absolute inset-0 transition-all duration-300 ${
            isDark
              ? "rotate-0 scale-100 opacity-100 text-(--primary)"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>
    </button>
  );
}
