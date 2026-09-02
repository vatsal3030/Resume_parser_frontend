"use client";
import React, { useState } from 'react';
import { Trash2, Pin, PinOff, Copy, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import api from '@/lib/api';
import { useToast } from '@/components/ui/toast';

/**
 * ResultActions — CRUD action bar for any generated tool output.
 * Shows Delete, Pin/Unpin, and Copy buttons.
 * 
 * Props:
 * - resultId: string (ToolOutput ID from history)
 * - isPinned: boolean
 * - onDelete: () => void (callback after deletion)
 * - onPinToggle: (newPinnedState) => void
 * - resultText: string (text content to copy to clipboard)
 * - className: string
 */
export function ResultActions({ resultId, isPinned = false, onDelete, onPinToggle, resultText, className = '' }) {
 const [copied, setCopied] = useState(false);
 const [confirmDelete, setConfirmDelete] = useState(false);
 const [deleting, setDeleting] = useState(false);
 const [pinned, setPinned] = useState(isPinned);
 const toast = useToast();

 const handleDelete = async () => {
 if (!resultId) return;
 setDeleting(true);
 try {
 await api.delete(`/history/${resultId}`);
 toast.success('Deleted', 'Moved to trash');
 setConfirmDelete(false);
 onDelete?.();
 } catch (err) {
 toast.error('Failed', 'Could not delete item');
 } finally {
 setDeleting(false);
 }
 };

 const handlePinToggle = async () => {
 if (!resultId) return;
 try {
 const newPinned = !pinned;
 await api.put(`/history/${resultId}`, { isPinned: newPinned });
 setPinned(newPinned);
 toast.info(newPinned ? 'Pinned' : 'Unpinned', newPinned ? 'Item pinned to top' : 'Item unpinned');
 onPinToggle?.(newPinned);
 } catch (err) {
 toast.error('Failed', 'Could not update pin status');
 }
 };

 const handleCopy = () => {
 if (!resultText) return;
 navigator.clipboard.writeText(resultText).then(() => {
 setCopied(true);
 toast.success('Copied', 'Content copied to clipboard');
 setTimeout(() => setCopied(false), 2000);
 });
 };

 return (
 <>
 <div className={`flex items-center gap-2 flex-wrap ${className}`}>
 {/* Copy */}
 {resultText && (
 <Button 
 variant="outline" 
 size="sm" 
 onClick={handleCopy}
 className="text-xs font-bold"
 >
 {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
 {copied ? 'Copied' : 'Copy'}
 </Button>
 )}

 {/* Pin/Unpin */}
 {resultId && (
 <Button 
 variant="outline" 
 size="sm" 
 onClick={handlePinToggle}
 className="text-xs font-bold"
 >
 {pinned ? <PinOff className="w-3 h-3 mr-1" /> : <Pin className="w-3 h-3 mr-1" />}
 {pinned ? 'Unpin' : 'Pin'}
 </Button>
 )}

 {/* Delete */}
 {resultId && (
 <Button 
 variant="outline" 
 size="sm" 
 onClick={() => setConfirmDelete(true)}
 className="text-xs font-bold text-red-600 hover:bg-red-50 hover:border-red-400"
 >
 <Trash2 className="w-3 h-3 mr-1" /> Delete
 </Button>
 )}
 </div>

 {/* Confirm dialog */}
 <ConfirmDialog
 isOpen={confirmDelete}
 onClose={() => setConfirmDelete(false)}
 onConfirm={handleDelete}
 title="Delete this result?"
 message="This will move the result to trash. You can restore it within 30 days."
 confirmLabel="Delete"
 variant="danger"
 loading={deleting}
 />
 </>
 );
}
