"use client";
import React from "react";

/**
 * PageShell — Standard page wrapper for consistent layout.
 * All dashboard pages should use this as their root wrapper.
 * 
 * @param {string} title - Page heading (h1)
 * @param {string} subtitle - Optional subtitle/description
 * @param {string} subtitleColor - Tailwind bg class for subtitle highlight
 * @param {React.ReactNode} actions - Optional right-aligned action buttons
 * @param {React.ReactNode} children - Page content
 * @param {boolean} noPadding - Skip padding (for full-bleed layouts like studio)
 * @param {string} maxWidth - Override max-width class
 */
export function PageShell({
  title,
  subtitle,
  subtitleColor = "bg-brutal-yellow",
  actions,
  children,
  noPadding = false,
  maxWidth = "max-w-7xl",
  className = "",
}) {
  return (
    <div
      className={`min-h-full animate-fade-in ${
        noPadding ? "" : "p-4 sm:p-6 lg:p-8"
      } ${className}`}
    >
      <div className={`${noPadding ? "" : `${maxWidth} mx-auto`} w-full`}>
        {/* Page Header */}
        {(title || actions) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b-4 border-brutal-black pb-4">
            <div>
              {title && (
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tighter">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p
                  className={`text-base sm:text-lg font-bold mt-2 ${subtitleColor} inline-block px-2 border-2 border-brutal-black shadow-brutal-sm`}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-3 shrink-0">
                {actions}
              </div>
            )}
          </div>
        )}

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}
