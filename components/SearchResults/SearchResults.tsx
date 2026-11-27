import type { ReactNode } from 'react';
import './SearchResults.css';

export interface SearchResultItem {
    key: string;
    title: string;
    sub: string;
    imageUrl: string;
    disabled?: boolean;
    onSelect: () => void;
}

interface SearchResultsProps {
    items: SearchResultItem[];
    /** Texto si no hay resultados */
    notFound: string;
    className?: string;
    /** Debajo de los resultados (p. ej. "Ver todos los resultados" del buscador de la web) */
    footer?: ReactNode;
}

/* Desplegable de resultados de un buscador (modal de crear RVW, onboarding, perfil y buscador de la web).
   Cada resultado es un botón en una lista, para poder elegirlo con teclado */
export default function SearchResults({ items, notFound, className = '', footer }: SearchResultsProps) {
    return (
        <div className={`search-dropdown-results ${className}`.trim()}>
            {items.length > 0 ? (
                <ul className="search-results-list">
                    {items.map((item) => (
                        <li key={item.key}>
                            <button
                                type="button"
                                className="search-result-item"
                                disabled={item.disabled}
                                onClick={item.onSelect}
                            >
                                <img src={item.imageUrl} alt="" />
                                <span className="search-result-text">
                                    <span className="result-title">{item.title}</span>
                                    <span className="result-sub">{item.sub}</span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="search-no-results">{notFound}</p>
            )}
            {footer}
        </div>
    );
}
