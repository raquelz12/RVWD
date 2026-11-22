'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import './MoreMenu.css';

export type MoreMenuItem =
    | 'divider'
    | {
          label: string;
          /** Enlace a otra página */
          href?: string;
          /** Copia esta ruta (con el dominio delante) y avisa en el propio menú */
          copyPath?: string;
          onClick?: () => void;
          danger?: boolean;
      };

interface MoreMenuProps {
    items: MoreMenuItem[];
    /** Texto para lectores de pantalla del botón ⋮ */
    label?: string;
    className?: string;
}

// Botón ⋮ en vertical con desplegable, con el mismo aspecto que el de las tablas de admin
export default function MoreMenu({ items, label = 'Más opciones', className = '' }: MoreMenuProps) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Se cierra al pulsar fuera o con Escape
    useEffect(() => {
        if (!open) return;
        const onPointer = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const copy = async (path: string) => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}${path}`);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                setOpen(false);
            }, 1200);
        } catch {
            setOpen(false);
        }
    };

    return (
        // El clic no llega a la tarjeta o fila que lo contiene
        <div className={`more-menu ${open ? 'is-open' : ''} ${className}`} ref={ref} onClick={(e) => e.stopPropagation()}>
            <button
                type="button"
                className="more-menu-trigger"
                aria-label={label}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={(e) => {
                    // Por si está dentro de un enlace
                    e.preventDefault();
                    setOpen((o) => !o);
                }}
            >
                ⋮
            </button>
            {open && (
                <div className="more-menu-list" role="menu">
                    {items.map((item, i) => {
                        if (item === 'divider') return <div key={`divider-${i}`} className="more-menu-divider" />;
                        const itemClass = `more-menu-item ${item.danger ? 'danger' : ''}`;
                        if (item.href) {
                            return (
                                <Link key={item.label} href={item.href} className={itemClass} role="menuitem">
                                    {item.label}
                                </Link>
                            );
                        }
                        if (item.copyPath) {
                            const path = item.copyPath;
                            return (
                                <button key={item.label} type="button" className={itemClass} role="menuitem" onClick={() => copy(path)}>
                                    {copied ? 'Enlace copiado ✓' : item.label}
                                </button>
                            );
                        }
                        return (
                            <button
                                key={item.label}
                                type="button"
                                className={itemClass}
                                role="menuitem"
                                onClick={() => {
                                    item.onClick?.();
                                    setOpen(false);
                                }}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
