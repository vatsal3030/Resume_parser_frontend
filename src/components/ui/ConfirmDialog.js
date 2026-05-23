"use client";
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './button';

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, description, confirmText = "Confirm", cancelText = "Cancel", variant = "danger" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border-4 border-brutal-black shadow-[8px_8px_0_rgba(0,0,0,1)] max-w-md w-full p-6 animate-in zoom-in-95">
        <button onClick={onClose} className="absolute right-4 top-4 p-1 hover:bg-gray-100 border-2 border-transparent hover:border-brutal-black transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex gap-4 mb-6 mt-2">
          <div className={`p-3 border-4 border-brutal-black ${variant === 'danger' ? 'bg-red-400' : 'bg-brutal-yellow'}`}>
            <AlertTriangle className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">{title}</h2>
            <p className="text-sm font-bold text-gray-600 mt-1">{description}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-8 border-t-4 border-brutal-black pt-4">
          <Button variant="ghost" onClick={onClose} className="font-bold border-2 border-brutal-black">
            {cancelText}
          </Button>
          <Button 
            variant="brutal" 
            onClick={() => { onConfirm(); onClose(); }} 
            className={variant === 'danger' ? 'bg-red-500 text-white' : 'bg-brutal-yellow'}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
