import React from "react";

const VARIANT_STYLES = {
  default: "bg-gray-200 text-brutal-black",
  success: "bg-brutal-green text-white",
  warning: "bg-brutal-yellow text-brutal-black",
  error: "bg-red-400 text-brutal-black",
  info: "bg-brutal-blue text-brutal-black",
  pink: "bg-brutal-pink text-brutal-black",
  mint: "bg-brutal-mint text-brutal-black",
};

const SIZE_STYLES = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-1",
  lg: "text-sm px-3 py-1.5",
};

/**
 * BrutalBadge — Status badge with brutalist styling.
 *
 * @param {string} variant - 'default' | 'success' | 'warning' | 'error' | 'info' | 'pink' | 'mint'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {React.ReactNode} children - Badge content
 * @param {boolean} dot - Show a status dot before text
 */
export function BrutalBadge({
  variant = "default",
  size = "md",
  children,
  dot = false,
  className = "",
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-bold uppercase tracking-wider
        border-2 border-brutal-black shadow-brutal-sm
        ${VARIANT_STYLES[variant] || VARIANT_STYLES.default}
        ${SIZE_STYLES[size] || SIZE_STYLES.md}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-2 h-2 rounded-full ${
            variant === "success"
              ? "bg-green-800"
              : variant === "error"
              ? "bg-red-800"
              : variant === "warning"
              ? "bg-yellow-800"
              : "bg-gray-600"
          }`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

/**
 * Convenience: status-specific badges
 */
export function StatusBadge({ status }) {
  const map = {
    PENDING: { variant: "warning", label: "Pending" },
    PROCESSING: { variant: "info", label: "Processing" },
    COMPLETED: { variant: "success", label: "Completed" },
    FAILED: { variant: "error", label: "Failed" },
    SAVED: { variant: "default", label: "Saved" },
    APPLIED: { variant: "warning", label: "Applied" },
    INTERVIEWING: { variant: "info", label: "Interviewing" },
    OFFER: { variant: "success", label: "Offer" },
    REJECTED: { variant: "error", label: "Rejected" },
  };

  const config = map[status] || { variant: "default", label: status };

  return (
    <BrutalBadge variant={config.variant} dot size="sm">
      {config.label}
    </BrutalBadge>
  );
}
