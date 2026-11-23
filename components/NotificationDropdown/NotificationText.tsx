import Rvw from '../Rvw/Rvw';
import type { MockNotification } from '@/app/lib/mockNotifications';

const ACTION: Record<MockNotification['kind'], string> = {
    comment: 'Puso un comentario en tu',
    'fav-comment': 'Dio fav a tu comentario en tu',
    'fav-review': 'Dio fav a tu',
};

// Texto de una notificación: lo comparten la página /notifications y el desplegable de la campana
export default function NotificationText({ notif, className }: { notif: MockNotification; className?: string }) {
    return (
        <p className={className}>
            {ACTION[notif.kind]} <Rvw>RVW</Rvw> de <strong>{notif.reviewTitle}</strong>
        </p>
    );
}
