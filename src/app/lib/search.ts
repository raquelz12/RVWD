// Buscador de toda la web (header, barra inferior, portada y /search).
// TODO: la búsqueda vendrá del backend; mientras, se filtran los datos de prueba
import { mockAlbums, mockArtists, mockSongs } from './mockData';
import { listPublicUsers, userHref, usernameSlug } from './publicUsers';

export type SearchType = 'canciones' | 'albumes' | 'artistas' | 'usuarios';

export const SEARCH_TYPES: { id: SearchType; label: string; empty: string }[] = [
    { id: 'canciones', label: 'Canciones', empty: 'canciones' },
    { id: 'albumes', label: 'Álbumes', empty: 'álbumes' },
    { id: 'artistas', label: 'Artistas', empty: 'artistas' },
    { id: 'usuarios', label: 'Usuarios', empty: 'usuarios' },
];

/** Lo que se pone delante del subtítulo en el desplegable */
const TYPE_PREFIX: Record<SearchType, string> = {
    canciones: 'Canción',
    albumes: 'Álbum',
    artistas: 'Artista',
    usuarios: 'Usuario',
};

export const MAX_QUERY_LENGTH = 100;

export interface SearchHit {
    key: string;
    type: SearchType;
    title: string;
    /** Artista (canciones y álbumes) o @usuario (usuarios) */
    sub: string;
    imageUrl: string;
    href: string;
}

export type SearchResultsByType = Record<SearchType, SearchHit[]>;

/** El texto de ?q= (sin espacios a los lados y con un máximo de caracteres); si viene repetido, el primero */
export function parseSearchQuery(raw: string | string[] | undefined | null): string {
    const value = Array.isArray(raw) ? raw[0] : raw;
    return (value ?? '').trim().slice(0, MAX_QUERY_LENGTH).trim();
}

/** ?tipo= válido o null (= "Todo") */
export function parseSearchType(raw: string | string[] | undefined | null): SearchType | null {
    const value = Array.isArray(raw) ? raw[0] : raw;
    return SEARCH_TYPES.find((t) => t.id === value)?.id ?? null;
}

export const searchHref = (query: string, type: SearchType | null = null) =>
    `/search?q=${encodeURIComponent(query)}${type ? `&tipo=${type}` : ''}`;

/** Sin mayúsculas ni tildes: "Úsame" se encuentra con "usame" */
const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const CATALOG: SearchHit[] = [
    ...mockSongs.map((s): SearchHit => ({
        key: `cancion-${s.id}`, type: 'canciones', title: s.name, sub: s.artist.name, imageUrl: s.coverUrl, href: `/song/${s.id}`,
    })),
    ...mockAlbums.map((a): SearchHit => ({
        key: `album-${a.id}`, type: 'albumes', title: a.name, sub: a.artist.name, imageUrl: a.coverUrl, href: `/album/${a.id}`,
    })),
    ...mockArtists.map((a): SearchHit => ({
        key: `artista-${a.id}`, type: 'artistas', title: a.name, sub: 'Artista', imageUrl: a.pictureUrl, href: `/artist/${a.id}`,
    })),
    // Los perfiles desactivados no salen en el buscador
    ...listPublicUsers()
        .filter((u) => u.status === 'activa')
        .map((u): SearchHit => ({
            key: `usuario-${u.id}`, type: 'usuarios', title: u.name, sub: u.username, imageUrl: u.avatarUrl, href: userHref(u.username),
        })),
];

/** Qué textos de cada resultado cuentan para la búsqueda */
const searchableTexts = (hit: SearchHit): string[] => {
    switch (hit.type) {
        case 'usuarios':
            // Por nombre y por @usuario, con o sin la @
            return [hit.title, usernameSlug(hit.sub)];
        case 'artistas':
            return [hit.title];
        default:
            // Canciones y álbumes también por el artista
            return [hit.title, hit.sub];
    }
};

/** Todos los resultados, por tipo. Primero los que empiezan por lo buscado */
export function searchCatalog(query: string): SearchResultsByType {
    const results: SearchResultsByType = { canciones: [], albumes: [], artistas: [], usuarios: [] };
    const q = fold(usernameSlug(query.trim()));
    if (!q) return results;

    const scored = CATALOG.flatMap((hit) => {
        const texts = searchableTexts(hit).map(fold);
        if (!texts.some((t) => t.includes(q))) return [];
        return [{ hit, starts: texts.some((t) => t.startsWith(q)) }];
    });
    // sort es estable: dentro de cada grupo se queda el orden del catálogo
    scored.sort((a, b) => Number(b.starts) - Number(a.starts));
    for (const { hit } of scored) results[hit.type].push(hit);
    return results;
}

export const countResults = (results: SearchResultsByType) =>
    SEARCH_TYPES.reduce((total, t) => total + results[t.id].length, 0);

/** Los primeros resultados para el desplegable: hasta 2 de cada tipo, 6 en total */
export function searchPreview(query: string): { hits: (SearchHit & { label: string })[]; total: number } {
    const results = searchCatalog(query);
    const hits = SEARCH_TYPES.flatMap((t) => results[t.id].slice(0, 2))
        .slice(0, 6)
        .map((hit) => ({
            ...hit,
            label: hit.type === 'artistas' ? TYPE_PREFIX.artistas : `${TYPE_PREFIX[hit.type]} · ${hit.sub}`,
        }));
    return { hits, total: countResults(results) };
}
