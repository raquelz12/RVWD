'use client';

import './reviews.css';
import { Suspense, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Select from '../../../../components/Select/Select';
import ReviewBigCard from '../../../../components/ReviewBigCard/ReviewBigCard';
import Rvw from '../../../../components/Rvw/Rvw';

interface MyReview {
    id: string;
    type: 'Álbum' | 'Canción';
    title: string;
    artist: string;
    mediaHref: string;
    score: number;
    pageScore: number;
    titleReview: string;
    reviewText: string;
    /** AAAA-MM-DD */
    reviewDate: string;
    commentsCount: number;
    favoritesCount: number;
}

// TODO: vendrá del backend
const MY_REVIEWS: MyReview[] = [
    { id: '123', type: 'Álbum', title: 'No pasa nada hombre', artist: 'Clarent', mediaHref: '/album/123', score: 8.5, pageScore: 7.8, titleReview: 'Una obra maestra', reviewText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', reviewDate: '2026-11-15', commentsCount: 12, favoritesCount: 34 },
    { id: '124', type: 'Canción', title: 'Jukiar 1', artist: 'Clarent', mediaHref: '/song/1', score: 7, pageScore: 7.4, titleReview: 'Muy pegadiza', reviewText: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', reviewDate: '2026-10-02', commentsCount: 3, favoritesCount: 9 },
    { id: '125', type: 'Álbum', title: 'Motomami', artist: 'Rosalía', mediaHref: '/album/125', score: 9.5, pageScore: 8.9, titleReview: 'Imprescindible', reviewText: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', reviewDate: '2026-08-20', commentsCount: 21, favoritesCount: 58 },
    { id: '126', type: 'Álbum', title: 'El Madrileño', artist: 'C. Tangana', mediaHref: '/album/126', score: 6, pageScore: 8.1, titleReview: 'Me esperaba más', reviewText: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', reviewDate: '2026-06-11', commentsCount: 7, favoritesCount: 4 },
    { id: '127', type: 'Canción', title: 'Jukiar 3', artist: 'Clarent', mediaHref: '/song/3', score: 4.5, pageScore: 6.2, titleReview: 'No es para mí', reviewText: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.', reviewDate: '2026-03-28', commentsCount: 1, favoritesCount: 2 },
    { id: '128', type: 'Álbum', title: 'Jukiar', artist: 'Clarent', mediaHref: '/album/128', score: 8, pageScore: 7.5, titleReview: 'Gran debut', reviewText: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.', reviewDate: '2025-12-05', commentsCount: 5, favoritesCount: 15 },
    { id: '129', type: 'Canción', title: 'Jukiar 4', artist: 'Clarent', mediaHref: '/song/4', score: 10, pageScore: 8.7, titleReview: 'Perfecta', reviewText: 'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.', reviewDate: '2025-09-14', commentsCount: 9, favoritesCount: 27 },
];

const PAGE_SIZE = 5;

const SORT_OPTIONS = [
    { value: 'recientes', label: 'Más recientes' },
    { value: 'antiguas', label: 'Más antiguas' },
    { value: 'alta_nota', label: 'Mayor puntuación' },
    { value: 'baja_nota', label: 'Menor puntuación' },
];
const DEFAULT_SORT = 'recientes';

const SORTERS: Record<string, (a: MyReview, b: MyReview) => number> = {
    recientes: (a, b) => b.reviewDate.localeCompare(a.reviewDate),
    antiguas: (a, b) => a.reviewDate.localeCompare(b.reviewDate),
    alta_nota: (a, b) => b.score - a.score,
    baja_nota: (a, b) => a.score - b.score,
};

/* URL con solo lo que no es el valor por defecto: /profile/reviews, ?page=2, ?orden=alta_nota... */
const buildUrl = (page: number, sort: string) => {
    const params = new URLSearchParams();
    if (sort !== DEFAULT_SORT) params.set('orden', sort);
    if (page > 1) params.set('page', String(page));
    const query = params.toString();
    return query ? `/profile/reviews?${query}` : '/profile/reviews';
};

export default function ReviewsPage() {
    return (
        <main className="reviews-page-container">
            <h1 className="page-title reviews-page-title">Tus <Rvw>RVWS</Rvw></h1>
            {/* useSearchParams necesita un Suspense para que la build de producción no falle */}
            <Suspense fallback={null}>
                <ReviewsList />
            </Suspense>
        </main>
    );
}

function ReviewsList() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // La página y el orden salen de la URL; si traen algo raro se usa el valor por defecto
    const rawSort = searchParams.get('orden');
    const rawPage = searchParams.get('page');
    const sort = rawSort && rawSort in SORTERS ? rawSort : DEFAULT_SORT;
    const totalPages = Math.max(1, Math.ceil(MY_REVIEWS.length / PAGE_SIZE));
    const parsedPage = rawPage !== null && /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
    const page = Math.min(Math.max(parsedPage, 1), totalPages);

    // Si la URL traía valores no válidos, se corrige sin añadir otra entrada al historial
    const canonicalUrl = buildUrl(page, sort);
    useEffect(() => {
        const current = searchParams.toString();
        const currentUrl = current ? `/profile/reviews?${current}` : '/profile/reviews';
        if (currentUrl !== canonicalUrl) router.replace(canonicalUrl, { scroll: false });
    }, [canonicalUrl, searchParams, router]);

    const sorted = useMemo(() => [...MY_REVIEWS].sort(SORTERS[sort]), [sort]);
    const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Al cambiar el orden se vuelve a la página 1; al cambiar de página se sube arriba (scroll por defecto)
    const handleSortChange = (newSort: string) => router.replace(buildUrl(1, newSort), { scroll: false });
    const goToPage = (newPage: number) => router.replace(buildUrl(newPage, sort));

    if (MY_REVIEWS.length === 0) {
        return (
            <p className="reviews-page-empty">
                Aún no has escrito ninguna <Rvw>RVW</Rvw>.{' '}
                <Link href="/feed" className="inline-link">Descubre música</Link>
            </p>
        );
    }

    return (
        <>
            <Select
                options={SORT_OPTIONS}
                value={sort}
                onChange={handleSortChange}
                placeholder="Ordenar por..."
            />
            <ul className="reviews-page-list">
                {visible.map((review) => (
                    <li key={review.id}>
                        <ReviewBigCard
                            href={`/reviews/${review.id}`}
                            mediaHref={review.mediaHref}
                            reviewId={review.id}
                            ownReview
                            profile
                            type={review.type}
                            title={review.title}
                            artist={review.artist}
                            imageUrl="/placeholderCards.png"
                            score={review.score}
                            pageScore={review.pageScore}
                            titleReview={review.titleReview}
                            reviewText={review.reviewText}
                            reviewDate={review.reviewDate}
                            commentsCount={review.commentsCount}
                            favoritesCount={review.favoritesCount}
                        />
                    </li>
                ))}
            </ul>
            {totalPages > 1 && (
                <nav className="reviews-page-pagination" aria-label="Paginación de tus RVWs">
                    <button
                        type="button"
                        className="reviews-page-pagination-btn"
                        onClick={() => goToPage(page - 1)}
                        disabled={page === 1}
                    >
                        Anterior
                    </button>
                    <span className="reviews-page-pagination-info" aria-live="polite">
                        Página {page} de {totalPages}
                    </span>
                    <button
                        type="button"
                        className="reviews-page-pagination-btn"
                        onClick={() => goToPage(page + 1)}
                        disabled={page === totalPages}
                    >
                        Siguiente
                    </button>
                </nav>
            )}
        </>
    );
}
