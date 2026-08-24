"use client";
import React, { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * BrutalModal — Accessible modal with brutalist styling.
 * Features: focus trapping, Escape to close, overlay click to close, scale-in animation.
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Close handler
 * @param {string} title - Modal heading
 * @param {string} description - Optional description
 * @param {React.ReactNode} children - Modal body content
 * @param {React.ReactNode} footer - Optional footer (action buttons)
 * @param {string} maxWidth - Override max-width
 * @param {string} headerColor - Tailwind bg class for header
 * @param {boolean} closeOnOverlay - Whether clicking overlay closes the modal
 */
const SIZE_MAP = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
  "2xl": "max-w-4xl",
  "3xl": "max-w-5xl",
  "4xl": "max-w-6xl",
  "5xl": "max-w-7xl",
  full: "max-w-[96vw]",
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
  headerColor = "bg-brutal-yellow",
  closeOnOverlay = true,
}) {
  const resolvedMaxWidth = maxWidth || (size ? SIZE_MAP[size] || size : "max-w-lg");
  const modalRef = useRef(null);
  const previousFocus = useRef(null);

  // Store and restore focus
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      // Focus first focusable element inside modal
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
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
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
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        ref={modalRef}
        className={`relative ${resolvedMaxWidth} w-full bg-white border-4 border-brutal-black shadow-brutal-lg animate-scale-in`}
      >
        {/* Header */}
        {title && (
          <div
            className={`${headerColor} px-6 py-4 border-b-4 border-brutal-black flex items-center justify-between`}
          >
            <div>
              <h2
                id="modal-title"
                className="text-xl font-black uppercase tracking-tight"
              >
                {title}
              </h2>
              {description && (
                <p className="text-sm font-bold mt-1 opacity-80">
                  {description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close modal"
              className="shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t-4 border-brutal-black bg-gray-50 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
