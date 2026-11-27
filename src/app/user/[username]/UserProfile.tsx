'use client';

// Perfil de otro usuario: lo mismo que /profile pero sin editar, con Seguir y Denunciar.
// Reutiliza las clases de profile.css y top-songs.css; lo propio de esta página está en user.css

import { useState } from 'react';
import Link from 'next/link';
import '@/styles/top-songs.css';
import '@/styles/status-page.css';
import '../../profile/profile.css';
import './user.css';
import Button from '../../../../components/Button/Button';
import MediaCard from '../../../../components/MediaCard/MediaCard';
import ReviewBigCard from '../../../../components/ReviewBigCard/ReviewBigCard';
import Carousel from '../../../../components/Carousel/Carousel';
import ProfileStats from '../../../../components/ProfileStats/ProfileStats';
import MoreMenu, { type MoreMenuItem } from '../../../../components/MoreMenu/MoreMenu';
import Modal from '../../../../components/Modal/Modal';
import Rvw from '../../../../components/Rvw/Rvw';
import { useModal } from '@/context/ModalContext';
import { canSeeProfile, userHref, type FollowState, type PublicUser } from '../../lib/publicUsers';
import type { UserReview } from '../../lib/mockReviews';

/** RVWs que se enseñan en el perfil; el resto, en "Ver todas" */
const PROFILE_REVIEWS = 2;

const FOLLOW_LABEL: Record<FollowState, string> = {
    no: 'Seguir',
    solicitado: 'Solicitado',
    siguiendo: 'Siguiendo',
};

export default function UserProfile({ user, reviews }: { user: PublicUser; reviews: UserReview[] }) {
    const { openReport } = useModal();
    // TODO: seguir / pedir seguir de verdad cuando haya backend
    const [follow, setFollow] = useState<FollowState>(user.follow);
    const [confirmUnfollow, setConfirmUnfollow] = useState(false);

    // Solo el @usuario: ni foto, ni nombre, ni botones
    if (user.status === 'desactivada') {
        return (
            <div className="status-page">
                <h1 className="page-title user-profile-unavailable-title">{user.username}</h1>
                <p className="status-description">Esta cuenta está desactivada.</p>
            </div>
        );
    }

    const isPrivate = user.privacy === 'privada';
    const canSee = canSeeProfile(user, follow);
    const profileHref = userHref(user.username);
    const reviewsHref = `${profileHref}/reviews`;

    // Pública: seguir / dejar de seguir. Privada: pedirlo, cancelar la petición o dejar de seguir
    const toggleFollow = () => {
        // En una privada, dejar de seguir oculta su contenido y volver exige otra solicitud: se pregunta antes
        if (isPrivate && follow === 'siguiendo') setConfirmUnfollow(true);
        else if (follow !== 'no') setFollow('no');
        else setFollow(isPrivate ? 'solicitado' : 'siguiendo');
    };

    const unfollow = () => {
        setFollow('no');
        setConfirmUnfollow(false);
    };

    const menuItems: MoreMenuItem[] = [
        { label: 'Copiar enlace', copyPath: profileHref },
        'divider',
        {
            label: 'Denunciar perfil',
            danger: true,
            onClick: () => openReport({ type: 'Perfil', id: user.id, author: user.username }),
        },
    ];

    const renderSongSlots = () =>
        user.topSongs.map((song, index) => (
            <div key={`song-slot-${index}`} className="song-slot-container">
                {song ? (
                    <div className="filled-slot">
                        <MediaCard
                            title={song.title}
                            type="cancion"
                            artist={song.artist}
                            imageUrl={song.imageUrl}
                            forceShowInfo={true}
                            href={`/song/${song.id}`}
                        />
                    </div>
                ) : (
                    <div className="empty-slot">
                        <span className="empty-text-placeholder">Sin canción</span>
                    </div>
                )}
            </div>
        ));

    return (
        <div className="profile-container">
            <h1 className="page-title profile-title">Perfil de {user.username}</h1>
            <div className="profile-content">
                {/*----------------------- Datos del perfil ---------------------------- */}
                <section className="profile-info" aria-label="Datos del perfil">
                    <div className="profile-info-pic">
                        <img src={user.avatarUrl} alt={`Foto de perfil de ${user.name}`} />
                    </div>
                    <div className="profile-info-details">
                        <div className="profile-info-name">
                            <p className="profile-info-name-text">{user.name}</p>
                            <p className="profile-info-username">{user.username}</p>
                        </div>
                        <div className="profile-info-buttons">
                            <Button
                                variant={follow === 'no' ? 'primary' : 'outline'}
                                className="user-profile-follow-btn"
                                aria-pressed={follow !== 'no'}
                                onClick={toggleFollow}
                            >
                                {FOLLOW_LABEL[follow]}
                            </Button>
                            <MoreMenu items={menuItems} label="Opciones del perfil" />
                        </div>
                        {/* Las stats se ven también en un perfil privado */}
                        <ProfileStats className="profile-info-stats" {...user.stats} />
                        {canSee && user.bio && (
                            <div className="profile-info-bio">
                                <p className="profile-info-bio-text">{user.bio}</p>
                            </div>
                        )}
                    </div>
                </section>

                {canSee ? (
                    <>
                        {/*----------------------- Top 4 ---------------------------- */}
                        <section className="profile-top-songs" aria-labelledby="user-top-songs-title">
                            <h2 className="section-title profile-subtitle" id="user-top-songs-title">Sus top 4 canciones</h2>
                            <div className="top-songs-grid profile-top-songs-desktop">
                                {renderSongSlots()}
                            </div>
                            <div className="profile-top-songs-mobile">
                                <Carousel>
                                    {renderSongSlots()}
                                </Carousel>
                            </div>
                        </section>
                        {/*----------------------- Reseñas ---------------------------- */}
                        <section className="profile-reviews" aria-labelledby="user-reviews-title">
                            <h2 className="section-title profile-subtitle" id="user-reviews-title">Sus <Rvw>RVWS</Rvw></h2>
                            {reviews.length > 0 ? (
                                <>
                                    <ul className="profile-reviews-list">
                                        {reviews.slice(0, PROFILE_REVIEWS).map((review) => (
                                            <li key={review.id}>
                                                <ReviewBigCard
                                                    href={`/reviews/${review.id}`}
                                                    mediaHref={review.mediaHref}
                                                    reviewId={review.id}
                                                    username={user.username}
                                                    type={review.type}
                                                    title={review.title}
                                                    artist={review.artist}
                                                    imageUrl="/placeholderCards.png"
                                                    score={review.score}
                                                    pageScore={review.pageScore}
                                                    titleReview={review.titleReview}
                                                    reviewText={review.reviewText}
                                                    reviewDate={review.reviewDate}
                                                    commentsCount={review.commentsCount}
                                                    favoritesCount={review.favoritesCount}
                                                    profile
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                    {reviews.length > PROFILE_REVIEWS && (
                                        <Link href={reviewsHref} className="profile-view-all">Ver todas</Link>
                                    )}
                                </>
                            ) : (
                                <p className="user-profile-empty">
                                    {user.username} aún no ha escrito ninguna <Rvw>RVW</Rvw>.
                                </p>
                            )}
                        </section>
                    </>
                ) : (
                    <section className="user-profile-private" aria-labelledby="user-private-title">
                        <img src="/lock-solid-full.svg" alt="" className="user-profile-private-icon" />
                        <h2 className="block-title" id="user-private-title">Esta cuenta es privada</h2>
                        <p className="user-profile-private-text">
                            {follow === 'solicitado'
                                ? <>Has pedido seguirle. Cuando acepte, verás sus canciones favoritas y sus <Rvw>RVWS</Rvw>.</>
                                : <>Síguele para ver sus canciones favoritas y sus <Rvw>RVWS</Rvw>.</>}
                        </p>
                    </section>
                )}
            </div>
            <Modal isOpen={confirmUnfollow} onClose={() => setConfirmUnfollow(false)} labelledBy="user-unfollow-title">
                <div className="user-profile-modal">
                    <div className="user-profile-modal-header">
                        <h2 className="section-title" id="user-unfollow-title">¿Dejar de seguir a {user.username}?</h2>
                        <p className="user-profile-modal-text">
                            Su cuenta es privada: dejarás de ver sus canciones favoritas y sus <Rvw>RVWS</Rvw>, y para volver a seguirle tendrás que enviarle otra solicitud.
                        </p>
                    </div>
                    <div className="user-profile-modal-actions">
                        <Button type="button" variant="text" onClick={() => setConfirmUnfollow(false)}>
                            Cancelar
                        </Button>
                        <Button type="button" variant="danger" onClick={unfollow}>
                            Dejar de seguir
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
