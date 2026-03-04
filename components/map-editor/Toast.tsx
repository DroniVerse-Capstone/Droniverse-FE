"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type ToastType = "error" | "warning" | "success" | "info";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

const ICONS: Record<ToastType, string> = {
    error: "✕",
    warning: "⚠",
    success: "✓",
    info: "ℹ",
};

const STYLES: Record<ToastType, string> = {
    error:
        "bg-red-950/95 border-red-500/50 text-red-100 shadow-red-900/40",
    warning:
        "bg-amber-950/95 border-amber-500/50 text-amber-100 shadow-amber-900/40",
    success:
        "bg-emerald-950/95 border-emerald-500/50 text-emerald-100 shadow-emerald-900/40",
    info:
        "bg-sky-950/95 border-sky-500/50 text-sky-100 shadow-sky-900/40",
};

const ICON_STYLES: Record<ToastType, string> = {
    error: "bg-red-500/20 text-red-400",
    warning: "bg-amber-500/20 text-amber-400",
    success: "bg-emerald-500/20 text-emerald-400",
    info: "bg-sky-500/20 text-sky-400",
};

let _nextId = 0;

function ToastItem({
    toast,
    onDismiss,
}: {
    toast: Toast;
    onDismiss: (id: number) => void;
}) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const show = requestAnimationFrame(() => setVisible(true));
        const hide = setTimeout(() => setVisible(false), 2700);
        const remove = setTimeout(() => onDismiss(toast.id), 3000);
        return () => {
            cancelAnimationFrame(show);
            clearTimeout(hide);
            clearTimeout(remove);
        };
    }, [toast.id, onDismiss]);

    return (
        <div
            className={`
        flex items-center gap-3 px-4 py-3 rounded-md border backdrop-blur-md
        shadow-xl min-w-[260px] max-w-[380px]
        transition-all duration-300 ease-out
        ${STYLES[toast.type]}
        ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"}
      `}
        >
            <span
                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${ICON_STYLES[toast.type]}`}
            >
                {ICONS[toast.type]}
            </span>
            <span className="text-sm font-medium leading-snug">{toast.message}</span>
            <button
                onClick={() => onDismiss(toast.id)}
                className="ml-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity text-base leading-none"
            >
                ×
            </button>
        </div>
    );
}

export function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return createPortal(
        <div className="fixed top-20 right-6 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
            {toasts.map((t) => (
                <div key={t.id} className="pointer-events-auto">
                    <ToastItem toast={t} onDismiss={onDismiss} />
                </div>
            ))}
        </div>,
        document.body,
    );
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const show = useCallback(
        (message: string, type: ToastType = "info") => {
            const id = ++_nextId;
            setToasts((prev) => [...prev, { id, message, type }]);
        },
        [],
    );

    const toast = {
        error: (msg: string) => show(msg, "error"),
        warning: (msg: string) => show(msg, "warning"),
        success: (msg: string) => show(msg, "success"),
        info: (msg: string) => show(msg, "info"),
    };

    return { toasts, dismiss, toast };
}
