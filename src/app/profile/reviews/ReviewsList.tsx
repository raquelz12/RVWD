'use client';

// Lista de RVWs de un perfil con orden y paginación en la URL.
// La usan /profile/reviews (las tuyas) y /user/[username]/reviews (las de otro usuario)

import './reviews.css';
import { Suspense, useEffect, useMemo, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Select from '../../../../components/Select/Select';
import ReviewBigCard from '../../../../components/ReviewBigCard/ReviewBigCard';
import type { UserReview } from '../../lib/mockReviews';

const PAGE_SIZE = 5;

const SORT_OPTIONS = [
    { value: 'recientes', label: 'Más recientes' },
    { value: 'antiguas', label: 'Más antiguas' },
    { value: 'alta_nota', label: 'Mayor puntuación' },
    { value: 'baja_nota', label: 'Menor puntuación' },
];
const DEFAULT_SORT = 'recientes';

const SORTERS: Record<string, (a: UserReview, b: UserReview) => number> = {
    recientes: (a, b) => b.reviewDate.localeCompare(a.reviewDate),
    antiguas: (a, b) => a.reviewDate.localeCompare(b.reviewDate),
    alta_nota: (a, b) => b.score - a.score,
    baja_nota: (a, b) => a.score - b.score,
};

interface ReviewsListProps {
    reviews: UserReview[];
    /** Ruta de la página, sin parámetros (p. ej. /profile/reviews) */
    basePath: string;
    /** Son las RVWs del usuario de la sesión: menú de RVW propia y "Tu nota" */
    own?: boolean;
    /** Lo que se enseña si no hay ninguna */
    empty: ReactNode;
    /** Texto para lectores de pantalla de la paginación */
    paginationLabel: string;
}

export default function ReviewsList(props: ReviewsListProps) {
    // useSearchParams necesita un Suspense para que la build de producción no falle
    return (
        <Suspense fallback={null}>
            <ReviewsListContent {...props} />
        </Suspense>
    );
}

function ReviewsListContent({ reviews, basePath, own = false, empty, paginationLabel }: ReviewsListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    /* URL con solo lo que no es el valor por defecto: basePath, ?page=2, ?orden=alta_nota... */
    const buildUrl = (page: number, sort: string) => {
        const params = new URLSearchParams();
        if (sort !== DEFAULT_SORT) params.set('orden', sort);
        if (page > 1) params.set('page', String(page));
        const query = params.toString();
        return query ? `${basePath}?${query}` : basePath;
    };

    // La página y el orden salen de la URL; si traen algo raro se usa el valor por defecto
    const rawSort = searchParams.get('orden');
    const rawPage = searchParams.get('page');
    const sort = rawSort && rawSort in SORTERS ? rawSort : DEFAULT_SORT;
    const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
    const parsedPage = rawPage !== null && /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
    const page = Math.min(Math.max(parsedPage, 1), totalPages);

    // Si la URL traía valores no válidos, se corrige sin añadir otra entrada al historial
    const canonicalUrl = buildUrl(page, sort);
    useEffect(() => {
        const current = searchParams.toString();
        const currentUrl = current ? `${basePath}?${current}` : basePath;
        if (currentUrl !== canonicalUrl) router.replace(canonicalUrl, { scroll: false });
    }, [canonicalUrl, basePath, searchParams, router]);

    const sorted = useMemo(() => [...reviews].sort(SORTERS[sort]), [reviews, sort]);
    const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Al cambiar el orden se vuelve a la página 1; al cambiar de página se sube arriba (scroll por defecto)
    const handleSortChange = (newSort: string) => router.replace(buildUrl(1, newSort), { scroll: false });
    const goToPage = (newPage: number) => router.replace(buildUrl(newPage, sort));

    if (reviews.length === 0) return <p className="reviews-page-empty">{empty}</p>;

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
                            ownReview={own}
                            username={review.author}
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
                <nav className="reviews-page-pagination" aria-label={paginationLabel}>
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
