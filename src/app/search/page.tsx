import { Suspense } from 'react';
import Link from 'next/link';
import MediaCard from '../../../components/MediaCard/MediaCard';
import ArtistCard from '../../../components/ArtistCard/ArtistCard';
import Tabs from '../../../components/Tabs/Tabs';
import {
    SEARCH_TYPES,
    countResults,
    parseSearchQuery,
    parseSearchType,
    searchCatalog,
    searchHref,
    type SearchHit,
    type SearchType,
} from '../lib/search';
import './search.css';

type SearchParams = Promise<{ q?: string | string[]; tipo?: string | string[] }>;

/** Cuántos resultados de cada tipo se enseñan en "Todo" (el resto, en su pestaña) */
const SECTION_LIMIT = 4;

export default function SearchPage({ searchParams }: { searchParams: SearchParams }) {
    // Con cacheComponents, los searchParams solo se conocen en runtime, así que van dentro de un Suspense
    return (
        <main className="search-page">
            <Suspense fallback={<p className="search-page-message" role="status">Buscando…</p>}>
                <SearchContent searchParams={searchParams} />
            </Suspense>
        </main>
    );
}

async function SearchContent({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const query = parseSearchQuery(params.q);
    // ?tipo= que no existe: se ve "Todo"
    const type = parseSearchType(params.tipo);

    if (query === '') {
        return (
            <>
                <h1 className="page-title search-page-title">Buscar</h1>
                <p className="search-page-message">
                    Escribe en el buscador para encontrar canciones, álbumes, artistas o usuarios.
                </p>
            </>
        );
    }

    // TODO: con backend, aquí irá la llamada (y su estado de error)
    const results = searchCatalog(query);
    const total = countResults(results);
    const title = <h1 className="page-title search-page-title">Resultados de «{query}»</h1>;

    if (total === 0) {
        return (
            <>
                {title}
                <p className="search-page-message">
                    No hay resultados para «{query}». Revisa cómo está escrito o prueba con otras palabras.
                </p>
            </>
        );
    }

    const tabs = [
        { id: 'todo', label: <TabLabel text="Todo" count={total} />, href: searchHref(query) },
        ...SEARCH_TYPES.map((t) => ({
            id: t.id,
            label: <TabLabel text={t.label} count={results[t.id].length} />,
            href: searchHref(query, t.id),
        })),
    ];

    return (
        <>
            {title}
            <Tabs tabs={tabs} currentTab={type ?? 'todo'} label="Tipo de resultado" />

            {type === null ? (
                SEARCH_TYPES.filter((t) => results[t.id].length > 0).map((t) => (
                    <section key={t.id} className="search-page-section" aria-labelledby={`search-${t.id}`}>
                        <div className="search-page-section-header">
                            <h2 id={`search-${t.id}`} className="section-title">{t.label}</h2>
                            {results[t.id].length > SECTION_LIMIT && (
                                <Link href={searchHref(query, t.id)} className="inline-link">
                                    Ver todos ({results[t.id].length})
                                </Link>
                            )}
                        </div>
                        <ResultList type={t.id} hits={results[t.id].slice(0, SECTION_LIMIT)} />
                    </section>
                ))
            ) : results[type].length === 0 ? (
                <p className="search-page-message">
                    No hay {SEARCH_TYPES.find((t) => t.id === type)?.empty} para «{query}».{' '}
                    <Link href={searchHref(query)} className="inline-link">Ver todos los resultados</Link>
                </p>
            ) : (
                <section className="search-page-section" aria-labelledby={`search-${type}`}>
                    <h2 id={`search-${type}`} className="sr-only">{SEARCH_TYPES.find((t) => t.id === type)?.label}</h2>
                    <ResultList type={type} hits={results[type]} />
                </section>
            )}
        </>
    );
}

function TabLabel({ text, count }: { text: string; count: number }) {
    return (
        <>
            {text} <span className="search-page-tab-count">{count}</span>
        </>
    );
}

function ResultList({ type, hits }: { type: SearchType; hits: SearchHit[] }) {
    if (type === 'usuarios') {
        return (
            <ul className="search-page-users">
                {hits.map((hit) => (
                    <li key={hit.key}>
                        <Link href={hit.href} className="search-page-user">
                            <img src={hit.imageUrl} alt="" className="search-page-user-avatar" />
                            <span className="search-page-user-info">
                                <span className="search-page-user-name">{hit.title}</span>
                                <span className="search-page-user-username">{hit.sub}</span>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        );
    }

    if (type === 'artistas') {
        return (
            <ul className="search-page-grid search-page-artists">
                {hits.map((hit) => (
                    <li key={hit.key}>
                        <ArtistCard name={hit.title} imageUrl={hit.imageUrl} href={hit.href} />
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <ul className="search-page-grid">
            {hits.map((hit) => (
                <li key={hit.key}>
                    <MediaCard
                        type={type === 'albumes' ? 'album' : 'cancion'}
                        title={hit.title}
                        artist={hit.sub}
                        imageUrl={hit.imageUrl}
                        forceShowInfo
                        href={hit.href}
                    />
                </li>
            ))}
        </ul>
    );
}
