import React from"react";

const VARIANT_STYLES = {
 default:"bg-(--surface-soft) text-(--body)",
 success:"bg-emerald-50 text-emerald-700",
 warning:"bg-amber-50 text-amber-700",
 error:"bg-red-50 text-red-700",
 info:"bg-sky-50 text-sky-700",
 pink:"bg-rose-50 text-rose-700",
 mint:"bg-teal-50 text-teal-700",
 primary:"bg-(--primary)/10 text-(--primary)",
};

const SIZE_STYLES = {
 sm:"text-[10px] px-2 py-0.5",
 md:"text-xs px-2.5 py-1",
 lg:"text-sm px-3 py-1.5",
};

/**
 * BrutalBadge — Refined pill badge with editorial styling.
 *
 * @param {string} variant - 'default' | 'success' | 'warning' | 'error' | 'info' | 'pink' | 'mint' | 'primary'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {React.ReactNode} children - Badge content
 * @param {boolean} dot - Show a status dot before text
 */
export function BrutalBadge({
 variant ="default",
 size ="md",
 children,
 dot = false,
 className ="",
}) {
 return (
 <span
 className={`
 inline-flex items-center gap-1.5 font-medium tracking-wide
 rounded-full
 ${VARIANT_STYLES[variant] || VARIANT_STYLES.default}
 ${SIZE_STYLES[size] || SIZE_STYLES.md}
 ${className}
 `}
 >
 {dot && (
 <span
 className={`w-1.5 h-1.5 rounded-full ${
 variant ==="success"
 ?"bg-emerald-500"
 : variant ==="error"
 ?"bg-red-500"
 : variant ==="warning"
 ?"bg-amber-500"
 : variant ==="info"
 ?"bg-sky-500"
 :"bg-(--muted-soft)"
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
 PENDING: { variant:"warning", label:"Pending" },
 PROCESSING: { variant:"info", label:"Processing" },
 COMPLETED: { variant:"success", label:"Completed" },
 FAILED: { variant:"error", label:"Failed" },
 SAVED: { variant:"default", label:"Saved" },
 APPLIED: { variant:"warning", label:"Applied" },
 INTERVIEWING: { variant:"info", label:"Interviewing" },
 OFFER: { variant:"success", label:"Offer" },
 REJECTED: { variant:"error", label:"Rejected" },
 };

 const config = map[status] || { variant:"default", label: status };

 return (
 <BrutalBadge variant={config.variant} dot size="sm">
 {config.label}
 </BrutalBadge>
 );
}
