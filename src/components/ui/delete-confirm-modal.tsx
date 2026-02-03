"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    itemName?: string;
    isDeleting?: boolean;
}

export function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    itemName,
    isDeleting = false
}: DeleteConfirmModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#0f141a] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    disabled={isDeleting}
                    aria-label="Close modal"
                >
                    <X className="size-5" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="size-8 text-red-500" />
                    </div>
                </div>

                {/* Content */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
                    <p className="text-gray-400 mb-3">{message}</p>
                    {itemName && (
                        <div className="bg-[#1c222b] border border-white/5 rounded-lg p-3 mt-4">
                            <p className="text-sm text-gray-500 mb-1">You are about to delete:</p>
                            <p className="text-white font-semibold truncate">{itemName}</p>
                        </div>
                    )}
                </div>

                {/* Warning */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
                    <p className="text-sm text-red-400 text-center">
                        ⚠️ This action cannot be undone
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 bg-[#1c222b] text-white font-semibold py-3 px-4 rounded-xl hover:bg-[#252d38] transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 bg-red-500 text-white font-semibold py-3 px-4 rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}
