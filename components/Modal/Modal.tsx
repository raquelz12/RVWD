"use client";

import { useEffect, useRef } from 'react';
import './Modal.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** id del título del modal, para que el lector de pantalla lo anuncie al abrir */
  labelledBy?: string;
}

const FOCUSABLE = 'input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])';

export default function Modal({ isOpen, onClose, children, labelledBy }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  // Si el clic empezó dentro (p. ej. seleccionando texto) y se suelta fuera, no se cierra
  const pressedOnOverlay = useRef(false);
  // onClose suele cambiar en cada render: con la ref los efectos solo dependen de isOpen
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };

    // Foco dentro del modal al abrir, y de vuelta a donde estaba al cerrar
    const previousFocus = document.activeElement as HTMLElement | null;
    const body = dialogRef.current?.querySelector('.modal-body');
    const first = body?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? dialogRef.current)?.focus();

    // Con overflow-x: hidden en html (globals.css) quien scrollea es <html>, no <body>: se bloquean los dos
    const html = document.documentElement;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      html.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => { pressedOnOverlay.current = e.target === e.currentTarget; }}
      onClick={(e) => {
        if (pressedOnOverlay.current && e.target === e.currentTarget) onClose();
        pressedOnOverlay.current = false;
      }}
    >
      <div
        ref={dialogRef}
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar modal">
          &times;
        </button>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
