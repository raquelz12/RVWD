'use client';

import { useState } from 'react';
import './FavButton.css';

interface FavButtonProps {
    /** Número de favoritos; si no se pasa, solo se ve la estrella */
    count?: number;
    /** Si ya está en favoritos al cargar */
    initialFaved?: boolean;
    /** Qué se marca, para lectores de pantalla (p. ej. "esta RVW", "el álbum") */
    itemLabel?: string;
    className?: string;
    onChange?: (faved: boolean) => void;
}

export default function FavButton({ count, initialFaved = false, itemLabel, className = '', onChange }: FavButtonProps) {
    const [faved, setFaved] = useState(initialFaved);

    // El contador refleja el clic propio sin esperar al servidor
    const shownCount = count === undefined ? undefined : count + (faved === initialFaved ? 0 : faved ? 1 : -1);
    const action = faved ? 'Quitar de favoritos' : 'Añadir a favoritos';

    const handleClick = (e: React.MouseEvent) => {
        // Puede estar dentro de una tarjeta clicable o de un enlace: el clic es solo para la estrella
        e.preventDefault();
        e.stopPropagation();
        const next = !faved;
        setFaved(next);
        onChange?.(next);
    };

    return (
        <button
            type="button"
            className={`fav-button ${faved ? 'is-faved' : ''} ${className}`}
            aria-pressed={faved}
            aria-label={itemLabel ? `${action}: ${itemLabel}` : action}
            onClick={handleClick}
        >
            {shownCount !== undefined && <span className="fav-count">{shownCount}</span>}
            <span className="fav-icon" aria-hidden="true" />
        </button>
    );
}
