import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import IconButton from "./IconButton";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
};

function Modal({ open, onClose, title, description, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;

    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className="m-auto max-h-[90vh] w-[min(92vw,42rem)] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-0 text-stone-900 shadow-xl backdrop:bg-stone-950/40"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-stone-100 bg-white px-6 py-5">
        <div>
          <h2 id={titleId} className="text-xl font-bold text-stone-950">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm leading-6 text-stone-500">
              {description}
            </p>
          )}
        </div>

        <IconButton
          label="Закрыть"
          onClick={onClose}
          className="shrink-0 text-stone-500"
        >
          <X className="size-4" aria-hidden="true" />
        </IconButton>
      </div>

      <div className="px-6 py-5">{children}</div>
    </dialog>
  );
}

export default Modal;
