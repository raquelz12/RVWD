import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { findPublicUser, isSessionUser, slugFromParam } from '../../lib/publicUsers';
import { reviewsBy } from '../../lib/mockReviews';
import UserProfile from './UserProfile';

type Params = Promise<{ username: string }>;

export default function UserPage({ params }: { params: Params }) {
    // Con cacheComponents, los params solo se conocen en runtime, así que van dentro de un Suspense
    return (
        <Suspense fallback={null}>
            <UserRoute params={params} />
        </Suspense>
    );
}

async function UserRoute({ params }: { params: Params }) {
    const slug = slugFromParam((await params).username);
    // Tu propio perfil se ve (y se edita) en /profile
    if (isSessionUser(slug)) redirect('/profile');
    const user = findPublicUser(slug);
    if (!user) notFound();
    // key: al pasar de un perfil a otro el estado (seguir...) empieza de cero
    return <UserProfile key={user.id} user={user} reviews={reviewsBy(user.username)} />;
}
