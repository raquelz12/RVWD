import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import FollowsView from '../../../profile/followers/FollowsView';
import {
    canSeeProfile,
    findPublicUser,
    followersHref,
    followersOf,
    followingHref,
    isSessionUser,
    slugFromParam,
    userHref,
} from '../../../lib/publicUsers';

type Params = Promise<{ username: string }>;

export default function UserFollowersPage({ params }: { params: Params }) {
    // Con cacheComponents, los params solo se conocen en runtime, así que van dentro de un Suspense
    return (
        <Suspense fallback={null}>
            <UserFollowersRoute params={params} />
        </Suspense>
    );
}

async function UserFollowersRoute({ params }: { params: Params }) {
    const slug = slugFromParam((await params).username);
    if (isSessionUser(slug)) redirect('/profile/followers');
    const user = findPublicUser(slug);
    if (!user) notFound();
    // Privada sin seguirle o desactivada: lo que se puede ver está en su perfil
    if (!canSeeProfile(user)) redirect(userHref(user.username));

    return (
        <FollowsView
            tab="followers"
            title={`Seguidores de ${user.username}`}
            followersHref={followersHref(user.username)}
            followingHref={followingHref(user.username)}
            users={followersOf(user.username)}
            listLabel={`Seguidores de ${user.username}`}
            empty={`${user.username} aún no tiene seguidores.`}
        />
    );
}
