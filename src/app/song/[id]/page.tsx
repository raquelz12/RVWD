'use client';

import { Fragment, Suspense, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '../../../../components/Button/Button';
import Score from '../../../../components/Score/Score';
import '@/styles/media-detail.css';
import './song.css';
import MediaCard from '../../../../components/MediaCard/MediaCard';
import Carousel from '../../../../components/Carousel/Carousel';
import ProfileStats from '../../../../components/ProfileStats/ProfileStats';
import Breadcrumbs from '../../../../components/Breadcrumbs/Breadcrumbs';
import { generateBreadcrumbs } from '@/utils/breadcrumbs';
import { getSongDetails } from '@/lib/api';
import { Song } from '@/types/music';
import FavButton from '../../../../components/FavButton/FavButton';
import Rvw from '../../../../components/Rvw/Rvw';
import { useModal } from '@/context/ModalContext';

function SongContent({ id }: { id: string }) {
    const { openAdd } = useModal();

    const [song, setSong] = useState<Song | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getSongDetails(id).then((data) => {
            if (cancelled) return;
            setSong(data);
            setIsLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (isLoading) {
        return (
            <div className="helper-wrapper">
                <span className="helper-text">Cargando canción...</span>
            </div>
        );
    }

    if (!song) {
        return (
            <div className="helper-wrapper">
                <span className="helper-text">Canción no encontrada</span>
                <Link href="/feed" className="custom-button primary helper-link">Volver al feed</Link>
            </div>
        );
    }

    const breadcrumbs = generateBreadcrumbs('song', song);

    // Maqueta hasta que haya backend
    const topRvwCards = [1, 2, 3, 4].map((n) => ({
        key: n,
        node: (
            <MediaCard
                href="/reviews/123"
                type="cancion"
                title={song.name}
                artist={song.artist.name}
                imageUrl={song.coverUrl}
                userName="@raquelz.12204"
                userPicture="/placeholderCards.png"
                score={8.5}
                forceShowInfo={true}
            />
        ),
    }));

    const nameRow = (
        <div className="media-name-row">
            <h1 className="page-title media-title">{song.name}</h1>
            <div className="media-title-actions">
                <FavButton itemLabel={song.name} className="title-fav-btn" />
            </div>
        </div>
    );

    const artistLink = (
        <Link href={`/artist/${song.artist.id}`} className="song-artist">{song.artist.name}</Link>
    );

    const scoreBlock = (
        <div className="score-block">
            <span className="score-label"><Rvw>RVWD</Rvw> score</span>
            <Score score={song.score} variant="white" input={false} />
        </div>
    );

    const stats = (
        <ProfileStats
            minutes={song.stats.minutes}
            favs={song.stats.favs}
            rvws={song.stats.rvws}
        />
    );

    const rvwButton = (
        <Button variant="primary" className="rvw-action-btn" onClick={() => openAdd({ type: 'cancion', id: song.id })}>
            <Rvw>RVW</Rvw>
        </Button>
    );

    return (
        <div className="song-page-container">
            <Breadcrumbs items={breadcrumbs} />

            {/* Escritorio y tablet */}
            <div className="desktop-song-view">
                <div className="song-header-desktop">
                    {/* Decorativa: el nombre ya va en el h1 */}
                    <img src={song.coverUrl} alt="" className="song-cover-desktop" />
                    <div className="song-info-desktop">
                        <div className="song-title-row">
                            <div>
                                {nameRow}
                                {artistLink}
                            </div>
                            {scoreBlock}
                        </div>
                        <div className="song-stats-row">
                            {stats}
                            {rvwButton}
                        </div>
                    </div>
                </div>
                <div className="song-sections">
                    <section className="song-section" aria-labelledby="song-rvws-desktop">
                        <h2 id="song-rvws-desktop" className="section-title">Top <Rvw>RVWS</Rvw></h2>
                        <ul className="cards-grid">
                            {topRvwCards.map((card) => (
                                <li key={card.key}>{card.node}</li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>

            {/* Móvil */}
            <div className="mobile-song-view">
                <div className="mobile-song-hero">
                    <img src={song.coverUrl} alt="" className="mobile-hero-bg" />
                    <div className="mobile-hero-gradient"></div>
                </div>
                <div className="mobile-song-content">
                    <div className="mobile-song-title">
                        {nameRow}
                        {artistLink}
                    </div>
                    {stats}
                    <div className="mobile-score-action">
                        {scoreBlock}
                        {rvwButton}
                    </div>
                    {/* Listado en carrusel */}
                    <div className="song-sections-mobile">
                        <section className="song-section" aria-labelledby="song-rvws-mobile">
                            <h2 id="song-rvws-mobile" className="section-title song-section-title">Top <Rvw>RVWS</Rvw></h2>
                            <Carousel>
                                {topRvwCards.map((card) => (
                                    <Fragment key={card.key}>{card.node}</Fragment>
                                ))}
                            </Carousel>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SongRoute() {
    const { id } = useParams<{ id: string }>();
    // key: al pasar de una canción a otra el estado empieza de cero
    return <SongContent key={id} id={id} />;
}

export default function SongPage() {
    // Con cacheComponents, useParams necesita un Suspense alrededor
    return (
        <Suspense
            fallback={
                <div className="helper-wrapper">
                    <span className="helper-text">Cargando canción...</span>
                </div>
            }
        >
            <SongRoute />
        </Suspense>
    );
}
