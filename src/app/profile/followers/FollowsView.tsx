// Página de seguidores / seguidos: título, pestañas (cada una con su URL) y la lista.
// La usan las cuatro rutas: /profile/followers, /profile/following y las de /user/[username]

import type { ReactNode } from 'react';
import './follows.css';
import Tabs from '../../../../components/Tabs/Tabs';
import FollowList from './FollowList';
import type { FollowListUser } from '../../lib/publicUsers';

export type FollowsTab = 'followers' | 'following';

interface FollowsViewProps {
    tab: FollowsTab;
    title: ReactNode;
    /** Rutas de las dos pestañas */
    followersHref: string;
    followingHref: string;
    users: FollowListUser[];
    canRemove?: boolean;
    empty: ReactNode;
    listLabel: string;
}

export default function FollowsView({ tab, title, followersHref, followingHref, users, canRemove, empty, listLabel }: FollowsViewProps) {
    return (
        <main className="follows-page">
            <h1 className="page-title follows-title">{title}</h1>
            <Tabs
                label="Seguidores y seguidos"
                currentTab={tab}
                tabs={[
                    { id: 'followers', label: 'Seguidores', href: followersHref },
                    { id: 'following', label: 'Siguiendo', href: followingHref },
                ]}
            />
            {/* TODO: con backend, paginación o carga por bloques (las listas pueden ser muy largas) */}
            <FollowList users={users} canRemove={canRemove} empty={empty} label={listLabel} />
        </main>
    );
}
