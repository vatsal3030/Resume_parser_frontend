"use client";
import React from "react";

/**
 * PageShell — Standard page wrapper for consistent layout.
 * Claude Editorial Typography & Glassmorphism.
 */
export function PageShell({
  title,
  subtitle,
  actions,
  children,
  noPadding = false,
  maxWidth = "max-w-7xl",
  fullWidth = false,
  className = "",
}) {
  return (
    <div
      className={`min-h-full animate-fade-in ${
        noPadding ? "" : "p-4 sm:p-6 lg:p-8"
      } ${className}`}
    >
      <div className={`${noPadding ? "" : (fullWidth ? "w-full" : `${maxWidth} mx-auto`)} w-full`}>
        {/* Page Header */}
        {(title || actions) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-(--hairline) pb-6">
            <div>
              {title && (
                <h1 className="text-3xl sm:text-4xl font-serif text-(--ink) tracking-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm sm:text-base text-(--muted) mt-1.5 font-normal leading-relaxed max-w-2xl">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2.5 shrink-0">
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
