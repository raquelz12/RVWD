import FollowsView from '../followers/FollowsView';
import { SESSION_USERNAME, followingOf } from '../../lib/publicUsers';

export default function FollowingPage() {
    return (
        <FollowsView
            tab="following"
            title="A quién sigues"
            followersHref="/profile/followers"
            followingHref="/profile/following"
            users={followingOf(SESSION_USERNAME)}
            listLabel="Usuarios a los que sigues"
            empty="Aún no sigues a nadie. Usa el buscador para encontrar a otros usuarios."
        />
    );
}
