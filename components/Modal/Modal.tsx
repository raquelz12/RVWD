"use client";

import { useEffect, useRef } from 'react';
import { revealInModal } from './revealInModal';
import './Modal.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** id del título del modal, para que el lector de pantalla lo anuncie al abrir */
  labelledBy?: string;
  /** Clase extra para el panel (p. ej. uno más ancho, como el editor de textos legales) */
  className?: string;
}

const FOCUSABLE = 'input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])';

export default function Modal({ isOpen, onClose, children, labelledBy, className = '' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
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
    // preventScroll: el foco no debe mover la página (en Safari de iPhone la desplaza)
    (first ?? dialogRef.current)?.focus({ preventScroll: true });

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

  // Teclado del móvil o la tablet: se pone encima de la página sin cambiar su alto, y Safari
  // además desplaza la vista. Se mide la zona que se ve de verdad (visualViewport) y cuánto
  // tapa el teclado, y el CSS coloca el contenido justo encima (Modal.css)
  useEffect(() => {
    const viewport = window.visualViewport;
    const overlay = overlayRef.current;
    if (!isOpen || !viewport || !overlay) return;

    const update = (event?: Event) => {
      // clientHeight es el alto de la página sin teclado; en Safari es más fiable que innerHeight
      const layoutHeight = document.documentElement.clientHeight;
      const keyboardInset = Math.max(0, layoutHeight - viewport.offsetTop - viewport.height);
      overlay.style.setProperty('--visual-top', `${Math.round(viewport.offsetTop)}px`);
      overlay.style.setProperty('--visual-height', `${Math.round(viewport.height)}px`);
      overlay.style.setProperty('--keyboard-inset', `${Math.round(keyboardInset)}px`);

      // Safari (barra flotante): bajo la barra de direcciones, con el teclado abierto, se ve la página
      // pero nunca los elementos fijos como el modal. Mientras el teclado está abierto se oculta la
      // página y su fondo pasa a ser el del panel (Modal.css). Con zoom no cuenta como teclado
      const keyboardOpen = viewport.scale < 1.01 && window.innerHeight - viewport.height > 150;
      document.documentElement.classList.toggle('modal-keyboard-open', keyboardOpen);

      // Al abrirse el teclado (resize) el panel encoge y el campo en el que se escribe puede quedar fuera:
      // se vuelve a enseñar moviendo solo el modal. En los scroll del viewport no, para no pelear con el dedo
      const active = document.activeElement;
      if (event?.type === 'resize' && active instanceof HTMLElement && active.matches('input, textarea') && dialogRef.current?.contains(active)) {
        requestAnimationFrame(() => revealInModal(active));
      }
    };

    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);

    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      document.documentElement.classList.remove('modal-keyboard-open');
    };
  }, [isOpen]);

  // Aviso de «hay más debajo» (degradado en Modal.css): se ve mientras quede contenido por ver.
  // Se revisa al desplazar y cuando cambia el tamaño del panel o de su contenido (campos que aparecen)
  useEffect(() => {
    const panel = dialogRef.current;
    const body = panel?.querySelector('.modal-body');
    if (!isOpen || !panel) return;

    const updateMoreBelow = () => {
      panel.classList.toggle('has-more-below', panel.scrollHeight - panel.scrollTop - panel.clientHeight > 8);
    };

    updateMoreBelow();
    panel.addEventListener('scroll', updateMoreBelow, { passive: true });
    const observer = new ResizeObserver(updateMoreBelow);
    observer.observe(panel);
    if (body) observer.observe(body);
    return () => {
      panel.removeEventListener('scroll', updateMoreBelow);
      observer.disconnect();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      onMouseDown={(e) => { pressedOnOverlay.current = e.target === e.currentTarget; }}
      onClick={(e) => {
        if (pressedOnOverlay.current && e.target === e.currentTarget) onClose();
        pressedOnOverlay.current = false;
      }}
    >
      <div
        ref={dialogRef}
        className={`modal-content ${className}`.trim()}
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
