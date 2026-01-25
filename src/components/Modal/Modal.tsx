import { useEffect, useRef, ReactNode } from "react";
import clsx from "clsx";
import Button from "../Button/Button";
import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={clsx('modal', className)}
      onClick={handleBackdropClick}
      aria-labelledby="modal-title"
    >
      <div className="modal-container">
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <Button variant="secondary" square onClick={onClose} aria-label="Close">
            ✕︎
          </Button>
        </header>
        <div className="modal-content">{children}</div>
      </div>
    </dialog>
  );
}

