'use client';

import Link from 'next/link';
import { useState } from 'react';
import './ReviewBigCard.css';
import Score from '../Score/Score';
import FavButton from '../FavButton/FavButton';
import MoreMenu, { type MoreMenuItem } from '../MoreMenu/MoreMenu';
import { formatDate } from '@/app/lib/adminFilters';
import { useModal } from '@/context/ModalContext';

interface ReviewBigCardProps {
    username?: string;
    userImageUrl?: string;
    followed?: boolean;
    type?: 'Álbum' | 'Canción' | 'Artista';
    title?: string;
    artist?: string;
    imageUrl?: string;
    score?: number;
    pageScore?: number;
    titleReview?: string;
    reviewText?: string;
    /** Fecha en formato AAAA-MM-DD; se enseña como DD/MM/AAAA */
    reviewDate?: string;
    commentsCount?: number;
    favoritesCount?: number;
    profile?: boolean; // Indica si la tarjeta sale solo la socre red o las dos
    /** Si se pasa, toda la tarjeta lleva a esta ruta, pero sus botones siguen funcionando por separado
     *  (así no hay botones dentro de un enlace) */
    href?: string;
    /** Ruta del álbum / canción / artista reseñado (opción "Ir al…" del menú ⋮) */
    mediaHref?: string;
    /** La reseña es del usuario: el menú enseña Editar / Eliminar en vez de Seguir / Denunciar */
    ownReview?: boolean;
    /** Id de la reseña (para la denuncia); si no se pasa, se usa href */
    reviewId?: string;
    onEdit?: () => void;
    onDelete?: () => void;
    onClick?: () => void;
}

const MEDIA_LABEL: Record<NonNullable<ReviewBigCardProps['type']>, string> = {
    'Álbum': 'Ir al álbum',
    'Canción': 'Ir a la canción',
    'Artista': 'Ir al artista',
};

export default function ReviewBigCard({
    username,
    userImageUrl,
    followed,
    type,
    title,
    artist,
    imageUrl,
    score,
    pageScore,
    titleReview,
    reviewText,
    reviewDate,
    commentsCount,
    favoritesCount,
    profile,
    href,
    mediaHref,
    ownReview,
    reviewId,
    onEdit,
    onDelete,
    onClick
}: ReviewBigCardProps) {
    const { openReport } = useModal();
    // TODO: seguir / dejar de seguir de verdad cuando haya backend
    const [isFollowed, setIsFollowed] = useState(!!followed);

    // Opciones del menú ⋮: las de una reseña propia o las de la de otra persona
    const menuItems: MoreMenuItem[] = [
        ...(mediaHref && type ? [{ label: MEDIA_LABEL[type], href: mediaHref }] : []),
        ...(href ? [{ label: 'Copiar enlace', copyPath: href }] : []),
        ...(ownReview
            ? [
                  { label: 'Editar', onClick: onEdit },
                  'divider' as const,
                  { label: 'Eliminar', onClick: onDelete, danger: true },
              ]
            : [
                  {
                      label: isFollowed ? `Dejar de seguir a ${username}` : `Seguir a ${username}`,
                      onClick: () => setIsFollowed((f) => !f),
                  },
                  'divider' as const,
                  {
                      label: 'Denunciar',
                      onClick: () => openReport({ type: 'RVW', id: reviewId ?? href ?? '', author: username ?? '' }),
                      danger: true,
                  },
              ]),
    ];

    return (
        <div className="review-big-card" onClick={onClick}>
            {userImageUrl && username && followed !== undefined && (
                <div className="review-big-card-header">
                    <div className="review-big-card-user">
                        <img src={userImageUrl} alt="" />
                        <div className="review-big-card-user-info">
                            <p className="user-name">{username}</p>
                            {!ownReview && (
                                <p className="user-followed">{isFollowed ? 'Le sigues' : 'No le sigues'}</p>
                            )}
                        </div>
                    </div>
                    <MoreMenu items={menuItems} label="Opciones de la RVW" className="review-big-card-extra" />
                </div>
            )}
            <div className="review-big-card-content">
                <div className="review-big-card-image">
                    <img src={imageUrl || '/placeholderCards.png'} alt={title} />
                </div>
                <div className="review-big-card-info">
                    <div className="review-big-card-header">
                        <div className="review-big-card-header-info">
                            <p className="review-big-card-type">{type}</p>
                            <p className="review-big-card-title">
                                {href ? (
                                    <Link href={href} className="review-big-card-link">{title}</Link>
                                ) : title}
                            </p>
                            <p className="review-big-card-artist">{artist}</p>
                        </div>
                        {profile && (
                        <div className="review-big-card-score">
                            <div className="review-big-card-score-wrapper">
                                <p className="review-big-card-score-text">Tu <span className="RVWS">RVW</span> score</p>
                                <Score variant="red" input={false} score={parseFloat(score?.toString() || '0')} />
                            </div>
                            <div className="review-big-card-score-wrapper">
                            <p className="review-big-card-score-text">
                                    <span className="RVWS">RVWD</span> score
                                </p>
                                <Score variant="white" input={false} score={parseFloat(pageScore?.toString() || '0')} />
                            </div>
                        </div>
                        ) || (
                            <div className="review-big-card-score">
                                <Score variant="red" input={false} score={parseFloat(score?.toString() || '0')} />
                            </div>
                        )}
                    </div>
                    <div className="review-big-card-review">
                        <span className="title">{titleReview}</span>
                        <span className="text">{reviewText}</span>
                    </div>
                    <div className="review-big-card-footer">
                        <p>{reviewDate ? formatDate(reviewDate) : null}</p>
                        <div className="review-big-card-footer-stats">
                            {/* Solo informa: los comentarios se ven dentro de la reseña */}
                            <span className="review-big-card-footer-stat" aria-label={`${commentsCount ?? 0} comentarios`}>
                                {commentsCount} <img src="/comments-solid-full.svg" alt="" />
                            </span>
                            <FavButton count={favoritesCount} itemLabel="esta RVW" className="review-big-card-footer-btn" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
