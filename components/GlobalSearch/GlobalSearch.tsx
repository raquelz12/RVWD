'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import { parseSearchQuery, searchHref, searchPreview } from '@/app/lib/search';
import './GlobalSearch.css';

interface GlobalSearchProps {
    /** Hacia dónde se abre el desplegable: abajo (header, portada) o arriba (barra inferior) */
    direction?: 'down' | 'up';
    initialQuery?: string;
    placeholder?: string;
    /** Nombre del formulario de búsqueda para lectores de pantalla */
    label?: string;
    autoFocus?: boolean;
    /** Clase extra del SearchBar */
    barClassName?: string;
    className?: string;
    /** Al ir a un resultado o a /search (p. ej. para cerrar el buscador de la barra inferior) */
    onNavigate?: () => void;
}

const ITEM_SELECTOR = '.search-result-item:not(:disabled)';

/* Buscador de la web: al escribir enseña los primeros resultados (SearchResults)
   y con Enter lleva a /search?q= con todos */
export default function GlobalSearch({
    direction = 'down',
    initialQuery = '',
    placeholder = 'Busca canciones, usuarios, ...',
    label = 'Buscar en la web',
    autoFocus,
    barClassName = '',
    className = '',
    onNavigate,
}: GlobalSearchProps) {
    const router = useRouter();
    const [query, setQuery] = useState(initialQuery);
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef<HTMLFormElement>(null);

    const trimmed = parseSearchQuery(query);
    const showResults = isOpen && trimmed !== '';
    const preview = showResults ? searchPreview(trimmed) : null;

    // Un toque o clic fuera cierra el desplegable
    useEffect(() => {
        if (!showResults) return;
        const handlePointerDown = (event: PointerEvent) => {
            if (rootRef.current?.contains(event.target as Node)) return;
            setIsOpen(false);
        };
        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [showResults]);

    const input = () => rootRef.current?.querySelector<HTMLInputElement>('input') ?? null;

    const go = (href: string) => {
        setIsOpen(false);
        // En móvil se esconde el teclado
        input()?.blur();
        router.push(href);
        onNavigate?.();
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (trimmed === '') return;
        go(searchHref(trimmed));
    };

    // Flechas: del campo a los resultados y entre ellos. Escape cierra el desplegable
    // (y no sigue hasta la barra inferior, que con Escape cierra el buscador entero)
    const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
        if (event.key === 'Escape' && showResults) {
            event.stopPropagation();
            setIsOpen(false);
            input()?.focus();
            return;
        }
        if ((event.key !== 'ArrowDown' && event.key !== 'ArrowUp') || !showResults) return;
        const items = Array.from(rootRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? []);
        if (items.length === 0) return;
        event.preventDefault();
        const current = items.indexOf(document.activeElement as HTMLElement);
        const down = event.key === 'ArrowDown';
        if (current === -1) {
            (down ? items[0] : items[items.length - 1]).focus();
        } else if (!down && current === 0) {
            input()?.focus();
        } else {
            items[Math.min(current + (down ? 1 : -1), items.length - 1)].focus();
        }
    };

    return (
        <form
            ref={rootRef}
            role="search"
            aria-label={label}
            className={`global-search ${direction === 'up' ? 'opens-up' : ''} ${className}`.trim()}
            onSubmit={submit}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
        >
            <SearchBar
                placeholder={placeholder}
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                }}
                autoFocus={autoFocus}
                className={barClassName}
            />
            {preview && (
                <SearchResults
                    className="global-search-results"
                    notFound={`No hay resultados para «${trimmed}»`}
                    items={preview.hits.map((hit) => ({
                        key: hit.key,
                        title: hit.title,
                        sub: hit.label,
                        imageUrl: hit.imageUrl,
                        onSelect: () => {
                            setQuery('');
                            go(hit.href);
                        },
                    }))}
                    footer={preview.total > 0 && (
                        <button type="submit" className="search-result-item global-search-more">
                            Ver todos los resultados de «{trimmed}»
                        </button>
                    )}
                />
            )}
        </form>
    );
}
