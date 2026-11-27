import FollowsView from './FollowsView';
import { SESSION_USERNAME, followersOf } from '../../lib/publicUsers';

export default function FollowersPage() {
    return (
        <FollowsView
            tab="followers"
            title="Tus seguidores"
            followersHref="/profile/followers"
            followingHref="/profile/following"
            users={followersOf(SESSION_USERNAME)}
            canRemove
            listLabel="Tus seguidores"
            empty="Aún no te sigue nadie."
        />
    );
}
