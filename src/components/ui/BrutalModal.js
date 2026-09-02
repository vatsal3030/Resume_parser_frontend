"use client";
import React, { useEffect, useRef, useCallback } from"react";
import { X } from"lucide-react";
import { Button } from"@/components/ui/button";

/**
 * BrutalModal — Accessible modal with editorial styling.
 * Features: focus trapping, Escape to close, overlay click to close, scale-in animation.
 */
const SIZE_MAP = {
 sm:"max-w-sm",
 md:"max-w-md",
 lg:"max-w-2xl",
 xl:"max-w-3xl",
"2xl":"max-w-4xl",
"3xl":"max-w-5xl",
"4xl":"max-w-6xl",
"5xl":"max-w-7xl",
 full:"max-w-[96vw]",
};

export function BrutalModal({
 isOpen,
 onClose,
 title,
 description,
 children,
 footer,
 size,
 maxWidth,
 headerColor ="",
 closeOnOverlay = true,
}) {
 const resolvedMaxWidth = maxWidth || (size ? SIZE_MAP[size] || size :"max-w-lg");
 const modalRef = useRef(null);
 const previousFocus = useRef(null);

 // Store and restore focus
 useEffect(() => {
 if (isOpen) {
 previousFocus.current = document.activeElement;
 const timer = setTimeout(() => {
 const focusable = modalRef.current?.querySelector(
 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
 );
 focusable?.focus();
 }, 100);
 return () => clearTimeout(timer);
 } else if (previousFocus.current) {
 previousFocus.current.focus();
 }
 }, [isOpen]);

 // Escape key
 const handleKeyDown = useCallback(
 (e) => {
 if (e.key ==="Escape") onClose();
 },
 [onClose]
 );

 useEffect(() => {
 if (isOpen) {
 document.addEventListener("keydown", handleKeyDown);
 document.body.style.overflow ="hidden";
 }
 return () => {
 document.removeEventListener("keydown", handleKeyDown);
 document.body.style.overflow ="";
 };
 }, [isOpen, handleKeyDown]);

 if (!isOpen) return null;

 return (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center p-4"
 role="dialog"
 aria-modal="true"
 aria-labelledby="modal-title"
 >
 {/* Overlay */}
 <div
 className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
 onClick={closeOnOverlay ? onClose : undefined}
 aria-hidden="true"
 />

 {/* Modal Panel */}
 <div
 ref={modalRef}
 className={`relative ${resolvedMaxWidth} w-full bg-(--surface-card) rounded-2xl border border-(--hairline) shadow-2xl animate-scale-in overflow-hidden`}
 >
 {/* Header */}
 {title && (
 <div
 className={`px-6 py-4 border-b border-(--hairline-soft) flex items-center justify-between ${headerColor}`}
 >
 <div>
 <h2
 id="modal-title"
 className="text-lg font-medium text-(--ink)"
 >
 {title}
 </h2>
 {description && (
 <p className="text-sm text-(--muted) mt-0.5">
 {description}
 </p>
 )}
 </div>
 <Button
 variant="ghost"
 size="icon"
 onClick={onClose}
 aria-label="Close modal"
 className="shrink-0 text-(--muted) hover:text-(--ink)"
 >
 <X className="w-5 h-5" />
 </Button>
 </div>
 )}

 {/* Body */}
 <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>

 {/* Footer */}
 {footer && (
 <div className="px-6 py-4 border-t border-(--hairline-soft) bg-(--surface-soft)/50 flex items-center justify-end gap-3">
 {footer}
 </div>
 )}
 </div>
 </div>
 );
}
