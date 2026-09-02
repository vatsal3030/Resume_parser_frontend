"use client";
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './button';

export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  variant = "danger" 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative bg-(--surface-card) border border-(--hairline) rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 p-1.5 text-(--muted) hover:text-(--ink) hover:bg-(--surface-soft) rounded-xl transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex gap-4 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            variant === 'danger' 
              ? 'bg-red-500/10 text-red-500 border-red-500/20' 
              : 'bg-(--primary)/10 text-(--primary) border-(--primary)/20'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-serif font-medium text-(--ink)">{title}</h2>
            <p className="text-xs text-(--muted) mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex gap-2.5 justify-end mt-6 border-t border-(--hairline-soft) pt-4">
          <Button 
            variant="secondary" 
            onClick={onClose} 
            className="text-xs py-2 px-3.5"
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'danger' ? 'destructive' : 'default'}
            onClick={() => { onConfirm(); onClose(); }} 
            className="text-xs py-2 px-3.5"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
