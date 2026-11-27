'use client';

// Lista de seguidores o seguidos de un perfil. La usan /profile/followers, /profile/following
// y las mismas de /user/[username]. En tus seguidores, además, se puede quitar a uno

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import './follows.css';
import Button from '../../../../components/Button/Button';
import FollowButton from '../../../../components/FollowButton/FollowButton';
import Modal from '../../../../components/Modal/Modal';
import MoreMenu from '../../../../components/MoreMenu/MoreMenu';
import { userHref, type FollowListUser, type FollowState } from '../../lib/publicUsers';

interface FollowListProps {
    users: FollowListUser[];
    /** Tus seguidores: cada fila tiene "Quitar seguidor" en el ⋮ */
    canRemove?: boolean;
    /** Lo que se enseña si no hay ninguno */
    empty: ReactNode;
    /** Nombre de la lista para lectores de pantalla */
    label: string;
}

export default function FollowList({ users, canRemove = false, empty, label }: FollowListProps) {
    // Tu relación con cada usuario de la lista. TODO: con backend, la cambia FollowButton de verdad
    const [follows, setFollows] = useState<Record<string, FollowState>>(() =>
        Object.fromEntries(users.map((u) => [u.id, u.follow])),
    );
    const [removedIds, setRemovedIds] = useState<string[]>([]);
    const [toRemove, setToRemove] = useState<FollowListUser | null>(null);
    const [status, setStatus] = useState('');
    // Fila que tenía el foco al quitar a alguien: el foco pasa a la siguiente (o a la anterior)
    const [focusIndex, setFocusIndex] = useState<number | null>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const emptyRef = useRef<HTMLParagraphElement>(null);

    const visible = users.filter((u) => !removedIds.includes(u.id));

    useEffect(() => {
        if (focusIndex === null) return;
        // Después de que el modal devuelva el foco (a un ⋮ que ya no existe)
        const frame = requestAnimationFrame(() => {
            const links = listRef.current?.querySelectorAll<HTMLElement>('.follows-user');
            const target = links?.[Math.min(focusIndex, links.length - 1)] ?? emptyRef.current;
            target?.focus({ preventScroll: true });
            setFocusIndex(null);
        });
        return () => cancelAnimationFrame(frame);
    }, [focusIndex]);

    const confirmRemove = () => {
        if (!toRemove) return;
        // TODO: quitar el seguidor en el backend
        setFocusIndex(visible.findIndex((u) => u.id === toRemove.id));
        setRemovedIds((prev) => [...prev, toRemove.id]);
        setStatus(`Has quitado a ${toRemove.username} de tus seguidores.`);
        setToRemove(null);
    };

    return (
        <>
            {/* Aviso para lectores de pantalla: la fila desaparece sin más */}
            <p className="sr-only" role="status">{status}</p>

            {visible.length === 0 ? (
                <p className="follows-empty" ref={emptyRef} tabIndex={-1}>{empty}</p>
            ) : (
                <ul className="follows-list" aria-label={label} ref={listRef}>
                    {visible.map((user) => (
                        <li key={user.id} className="follows-item">
                            {/* Solo la parte del usuario es enlace: los botones van fuera */}
                            <Link href={userHref(user.username)} className="follows-user">
                                <img src={user.avatarUrl} alt="" className="follows-avatar" />
                                <span className="follows-info">
                                    <span className="follows-name">{user.name}</span>
                                    <span className="follows-username">{user.username}</span>
                                </span>
                            </Link>
                            <div className="follows-actions">
                                {user.isSelf ? (
                                    <span className="follows-self">Tú</span>
                                ) : (
                                    <FollowButton
                                        className="follows-follow-btn"
                                        username={user.username}
                                        isPrivate={user.privacy === 'privada'}
                                        state={follows[user.id] ?? user.follow}
                                        onChange={(state) => setFollows((prev) => ({ ...prev, [user.id]: state }))}
                                    />
                                )}
                                {canRemove && (
                                    <MoreMenu
                                        label={`Opciones de ${user.username}`}
                                        items={[{ label: 'Quitar seguidor', danger: true, onClick: () => setToRemove(user) }]}
                                    />
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Mismo aspecto que la confirmación de dejar de seguir (FollowButton.css) */}
            <Modal isOpen={toRemove !== null} onClose={() => setToRemove(null)} labelledBy="follows-remove-title">
                <div className="follow-button-modal">
                    <div className="follow-button-modal-header">
                        <h2 className="section-title" id="follows-remove-title">
                            ¿Quitar a {toRemove?.username} de tus seguidores?
                        </h2>
                        <p className="follow-button-modal-text">
                            No se le avisará. Podrá volver a seguirte, o pedírtelo si tu cuenta es privada.
                        </p>
                    </div>
                    <div className="follow-button-modal-actions">
                        <Button type="button" variant="text" onClick={() => setToRemove(null)}>
                            Cancelar
                        </Button>
                        <Button type="button" variant="danger" onClick={confirmRemove}>
                            Quitar
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
