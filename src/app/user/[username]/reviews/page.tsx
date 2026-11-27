import '../../../profile/reviews/reviews.css';
import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import Rvw from '../../../../../components/Rvw/Rvw';
import ReviewsList from '../../../profile/reviews/ReviewsList';
import { reviewsBy } from '../../../lib/mockReviews';
import { canSeeProfile, findPublicUser, isSessionUser, slugFromParam, userHref } from '../../../lib/publicUsers';

type Params = Promise<{ username: string }>;

export default function UserReviewsPage({ params }: { params: Params }) {
    // Con cacheComponents, los params solo se conocen en runtime, así que van dentro de un Suspense
    return (
        <Suspense fallback={null}>
            <UserReviewsRoute params={params} />
        </Suspense>
    );
}

async function UserReviewsRoute({ params }: { params: Params }) {
    const slug = slugFromParam((await params).username);
    if (isSessionUser(slug)) redirect('/profile/reviews');
    const user = findPublicUser(slug);
    if (!user) notFound();
    // Privada sin seguirle o desactivada: lo que se puede ver está en su perfil
    if (!canSeeProfile(user)) redirect(userHref(user.username));

    const profileHref = userHref(user.username);
    return (
        <main className="reviews-page-container">
            <h1 className="page-title reviews-page-title"><Rvw>RVWS</Rvw> de {user.username}</h1>
            <ReviewsList
                reviews={reviewsBy(user.username)}
                basePath={`${profileHref}/reviews`}
                paginationLabel={`Paginación de las RVWs de ${user.username}`}
                empty={<>{user.username} aún no ha escrito ninguna <Rvw>RVW</Rvw>.</>}
            />
        </main>
    );
}
