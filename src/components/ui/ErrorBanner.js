"use client";
import React, { useState } from"react";
import { AlertTriangle, X } from"lucide-react";
import { Button } from"@/components/ui/button";

/**
 * ErrorBanner — Dismissible error notification with optional retry.
 *
 * @param {string} message - Error message
 * @param {function} onRetry - Optional retry handler
 * @param {function} onDismiss - Optional dismiss handler
 * @param {string} className - Additional classes
 */
export function ErrorBanner({ message, onRetry, onDismiss, className ="" }) {
 const [dismissed, setDismissed] = useState(false);

 if (dismissed) return null;

 const handleDismiss = () => {
 setDismissed(true);
 onDismiss?.();
 };

 return (
 <div
 role="alert"
 aria-live="assertive"
 className={`
 flex items-start gap-3 p-4 bg-red-100 border border-(--hairline)
 shadow-sm animate-slide-up ${className}
 `}
 >
 <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
 <div className="flex-1 min-w-0">
 <p className="font-bold text-sm text-(--ink)">{message}</p>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 {onRetry && (
 <Button variant="outline" size="sm" onClick={onRetry}>
 Retry
 </Button>
 )}
 <button
 onClick={handleDismiss}
 className="text-gray-500 hover:text-(--ink) transition-colors"
 aria-label="Dismiss error"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 </div>
 );
}
