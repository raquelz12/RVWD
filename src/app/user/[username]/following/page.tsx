import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import FollowsView from '../../../profile/followers/FollowsView';
import {
    canSeeProfile,
    findPublicUser,
    followersHref,
    followingHref,
    followingOf,
    isSessionUser,
    slugFromParam,
    userHref,
} from '../../../lib/publicUsers';

type Params = Promise<{ username: string }>;

export default function UserFollowingPage({ params }: { params: Params }) {
    // Con cacheComponents, los params solo se conocen en runtime, así que van dentro de un Suspense
    return (
        <Suspense fallback={null}>
            <UserFollowingRoute params={params} />
        </Suspense>
    );
}

async function UserFollowingRoute({ params }: { params: Params }) {
    const slug = slugFromParam((await params).username);
    if (isSessionUser(slug)) redirect('/profile/following');
    const user = findPublicUser(slug);
    if (!user) notFound();
    // Privada sin seguirle o desactivada: lo que se puede ver está en su perfil
    if (!canSeeProfile(user)) redirect(userHref(user.username));

    return (
        <FollowsView
            tab="following"
            title={`A quién sigue ${user.username}`}
            followersHref={followersHref(user.username)}
            followingHref={followingHref(user.username)}
            users={followingOf(user.username)}
            listLabel={`Usuarios a los que sigue ${user.username}`}
            empty={`${user.username} aún no sigue a nadie.`}
        />
    );
}
