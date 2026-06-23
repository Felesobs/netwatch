"use client";

import {
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/utils";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Built on native <dialog> rather than a hand-rolled div + portal focus
 * trap: the browser gives us modal semantics, focus containment, Escape-
 * to-close, and ::backdrop styling for free, which is both less code and
 * more robust than reimplementing ARIA dialog behavior.
 */
export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    const handleCancel = (event: Event) => {
      // Let the native Escape-to-close happen, just sync our state.
      event.preventDefault();
      onClose();
    };

    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("cancel", handleCancel);
    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("cancel", handleCancel);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="dialog-title"
      aria-describedby={description ? "dialog-description" : undefined}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className={cn(
        "m-auto w-full max-w-md rounded-(--radius-lg) border border-border bg-surface p-0 shadow-(--shadow-lg) backdrop:bg-black/40 backdrop:backdrop-blur-sm",
        "open:animate-[dialog-in_0.18s_ease-out]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border p-5">
        <div>
          <h2 id="dialog-title" className="text-base font-semibold text-ink-primary">
            {title}
          </h2>
          {description && (
            <p id="dialog-description" className="mt-1 text-sm text-ink-secondary">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="rounded-(--radius-sm) p-1.5 text-ink-tertiary transition-colors hover:bg-canvas hover:text-ink-primary"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>,
    document.body,
  );
}
