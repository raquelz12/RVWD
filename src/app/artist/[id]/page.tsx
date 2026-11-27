'use client';

import { Fragment, Suspense, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '../../../../components/Button/Button';
import Score from '../../../../components/Score/Score';
import '@/styles/media-detail.css';
import './artist.css';
import MediaCard from '../../../../components/MediaCard/MediaCard';
import Carousel from '../../../../components/Carousel/Carousel';
import ProfileStats from '../../../../components/ProfileStats/ProfileStats';
import Breadcrumbs from '../../../../components/Breadcrumbs/Breadcrumbs';
import { generateBreadcrumbs } from '@/utils/breadcrumbs';
import { getArtistDetails } from '@/lib/api';
import { Artist } from '@/types/music';
import FavButton from '../../../../components/FavButton/FavButton';
import Rvw from '../../../../components/Rvw/Rvw';
import { useModal } from '@/context/ModalContext';

interface CardSection {
    key: string;
    title: ReactNode;
    cards: { key: string | number; node: ReactNode }[];
}

/** Las 4 mejor puntuadas: el Carousel solo tiene 4 letras (Я V W D) */
const topByScore = <T extends { score: number }>(items: T[]) =>
    [...items].sort((a, b) => b.score - a.score).slice(0, 4);

function ArtistContent({ id }: { id: string }) {
    const { openAdd } = useModal();

    const [artist, setArtist] = useState<Artist | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // Maqueta hasta que haya backend: solo cambia en local
    const [isFollowed, setIsFollowed] = useState(false);
    const [notify, setNotify] = useState(false);

    useEffect(() => {
        let cancelled = false;
        getArtistDetails(id).then((data) => {
            if (cancelled) return;
            setArtist(data);
            setIsLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (isLoading) {
        return (
            <div className="helper-wrapper">
                <span className="helper-text">Cargando artista...</span>
            </div>
        );
    }

    if (!artist) {
        return (
            <div className="helper-wrapper">
                <span className="helper-text">Artista no encontrado</span>
                <Link href="/feed" className="custom-button primary helper-link">Volver al feed</Link>
            </div>
        );
    }

    const breadcrumbs = generateBreadcrumbs('artist', artist);

    const toggleFollow = () => {
        // Sin seguir no hay avisos
        if (isFollowed) setNotify(false);
        setIsFollowed(!isFollowed);
    };

    const sections: CardSection[] = [
        {
            key: 'rvws',
            title: <>Top <Rvw>RVWS</Rvw></>,
            // Maqueta hasta que haya backend
            cards: [1, 2, 3, 4].map((n) => ({
                key: n,
                node: (
                    <MediaCard
                        href="/reviews/123"
                        type="album"
                        title="No pasa nada hombre"
                        artist={artist.name}
                        imageUrl="/placeholderCards.png"
                        userName="@raquelz.12204"
                        userPicture="/placeholderCards.png"
                        score={8.5}
                        forceShowInfo={true}
                    />
                ),
            })),
        },
        {
            key: 'albums',
            title: 'Top álbumes',
            cards: topByScore(artist.albums).map((album) => ({
                key: album.id,
                node: (
                    <MediaCard
                        href={`/album/${album.id}`}
                        type="album"
                        title={album.name}
                        artist={artist.name}
                        imageUrl={album.coverUrl}
                        score={album.score}
                        forceShowInfo={true}
                        scoreType="white"
                    />
                ),
            })),
        },
        {
            key: 'songs',
            title: 'Top canciones',
            cards: topByScore(artist.songs).map((song) => ({
                key: song.id,
                node: (
                    <MediaCard
                        href={`/song/${song.id}`}
                        type="cancion"
                        title={song.name}
                        artist={artist.name}
                        imageUrl={song.coverUrl}
                        score={song.score}
                        forceShowInfo={true}
                        scoreType="white"
                    />
                ),
            })),
        },
    ].filter((section) => section.cards.length > 0);

    // Las dos vistas (escritorio y móvil) comparten el estado de seguir y avisos
    const nameRow = (
        <div className="media-name-row">
            <h1 className="page-title media-title">{artist.name}</h1>
            <div className="media-title-actions">
                <FavButton itemLabel={artist.name} className="title-fav-btn" />
                <button
                    type="button"
                    className="bell-button"
                    aria-pressed={notify}
                    aria-label={notify ? `Dejar de avisarme de novedades de ${artist.name}` : `Avisarme de novedades de ${artist.name}`}
                    title={isFollowed ? undefined : 'Sigue al artista para activar los avisos'}
                    disabled={!isFollowed}
                    onClick={() => setNotify(!notify)}
                >
                    <span className="bell-button-icon" aria-hidden="true" />
                </button>
            </div>
        </div>
    );

    const scoreBlock = (
        <div className="score-block">
            <span className="score-label"><Rvw>RVWD</Rvw> score</span>
            <Score score={artist.score} variant="white" input={false} />
        </div>
    );

    const stats = (
        <ProfileStats
            followers={artist.stats.followers}
            favs={artist.stats.favs}
            rvws={artist.stats.rvws}
        />
    );

    const actions = (
        <div className="artist-actions">
            <Button variant="primary" className="artist-follow-btn" aria-pressed={isFollowed} onClick={toggleFollow}>
                {isFollowed ? 'Siguiendo' : 'Seguir'}
            </Button>
            <Button variant="primary" className="rvw-action-btn" onClick={() => openAdd({ type: 'artista', id: artist.id })}>
                <Rvw>RVW</Rvw>
            </Button>
        </div>
    );

    return (
        <div className="artist-page-container">
            <Breadcrumbs items={breadcrumbs} />

            {/* Escritorio y tablet */}
            <div className="desktop-artist-view">
                <div className="artist-header-desktop">
                    {/* Decorativa: el nombre ya va en el h1 */}
                    <img src={artist.pictureUrl} alt="" className="artist-cover-desktop" />
                    <div className="artist-info-desktop">
                        <div className="artist-title-row">
                            <div>
                                {nameRow}
                                <span className="artist-subtitle">Artista</span>
                            </div>
                            {scoreBlock}
                        </div>
                        <div className="artist-stats-row">
                            {stats}
                            {actions}
                        </div>
                    </div>
                </div>
                <div className="artist-sections">
                    {sections.map((section) => (
                        <section key={section.key} className="artist-section" aria-labelledby={`artist-${section.key}-desktop`}>
                            <h2 id={`artist-${section.key}-desktop`} className="section-title">{section.title}</h2>
                            <ul className="cards-grid">
                                {section.cards.map((card) => (
                                    <li key={card.key}>{card.node}</li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </div>

            {/* Móvil */}
            <div className="mobile-artist-view">
                <div className="mobile-artist-hero">
                    <img src={artist.pictureUrl} alt="" className="mobile-hero-bg" />
                    <div className="mobile-hero-gradient"></div>
                </div>
                <div className="mobile-artist-content">
                    <div className="mobile-artist-title">
                        {nameRow}
                        <span className="artist-subtitle">Artista</span>
                    </div>
                    {stats}
                    <div className="mobile-score-action">
                        {scoreBlock}
                        {actions}
                    </div>
                    {/* Listados en carrusel */}
                    <div className="artist-sections-mobile">
                        {sections.map((section) => (
                            <section key={section.key} className="artist-section" aria-labelledby={`artist-${section.key}-mobile`}>
                                <h2 id={`artist-${section.key}-mobile`} className="section-title artist-section-title">{section.title}</h2>
                                <Carousel>
                                    {section.cards.map((card) => (
                                        <Fragment key={card.key}>{card.node}</Fragment>
                                    ))}
                                </Carousel>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ArtistRoute() {
    const { id } = useParams<{ id: string }>();
    // key: al pasar de un artista a otro el estado empieza de cero (carga, seguir, avisos)
    return <ArtistContent key={id} id={id} />;
}

export default function ArtistPage() {
    // Con cacheComponents, useParams necesita un Suspense alrededor
    return (
        <Suspense
            fallback={
                <div className="helper-wrapper">
                    <span className="helper-text">Cargando artista...</span>
                </div>
            }
        >
            <ArtistRoute />
        </Suspense>
    );
}
