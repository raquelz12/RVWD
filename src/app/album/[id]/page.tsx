'use client';

import { Fragment, Suspense, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '../../../../components/Button/Button';
import Score from '../../../../components/Score/Score';
import '@/styles/media-detail.css';
import './album.css';
import MediaCard from '../../../../components/MediaCard/MediaCard';
import Carousel from '../../../../components/Carousel/Carousel';
import ProfileStats from '../../../../components/ProfileStats/ProfileStats';
import Breadcrumbs from '../../../../components/Breadcrumbs/Breadcrumbs';
import { generateBreadcrumbs } from '@/utils/breadcrumbs';
import { getAlbumDetails } from '@/lib/api';
import { Album } from '@/types/music';
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

function AlbumContent({ id }: { id: string }) {
    const { openAdd } = useModal();

    const [album, setAlbum] = useState<Album | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getAlbumDetails(id).then((data) => {
            if (cancelled) return;
            setAlbum(data);
            setIsLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (isLoading) {
        return (
            <div className="helper-wrapper">
                <span className="helper-text">Cargando álbum...</span>
            </div>
        );
    }

    if (!album) {
        return (
            <div className="helper-wrapper">
                <span className="helper-text">Álbum no encontrado</span>
                <Link href="/feed" className="custom-button primary helper-link">Volver al feed</Link>
            </div>
        );
    }

    const breadcrumbs = generateBreadcrumbs('album', album);

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
                        title={album.name}
                        artist={album.artist.name}
                        imageUrl={album.coverUrl}
                        userName="@raquelz.12204"
                        userPicture="/placeholderCards.png"
                        score={8.5}
                        forceShowInfo={true}
                    />
                ),
            })),
        },
        {
            key: 'songs',
            title: 'Top canciones',
            cards: topByScore(album.songs).map((song) => ({
                key: song.id,
                node: (
                    <MediaCard
                        href={`/song/${song.id}`}
                        type="cancion"
                        title={song.name}
                        artist={song.artist.name}
                        imageUrl={album.coverUrl}
                        score={song.score}
                        forceShowInfo={true}
                        scoreType="white"
                    />
                ),
            })),
        },
    ].filter((section) => section.cards.length > 0);

    const nameRow = (
        <div className="media-name-row">
            <h1 className="page-title media-title">{album.name}</h1>
            <div className="media-title-actions">
                <FavButton itemLabel={album.name} className="title-fav-btn" />
            </div>
        </div>
    );

    const artistLink = (
        <Link href={`/artist/${album.artist.id}`} className="album-artist">{album.artist.name}</Link>
    );

    const scoreBlock = (
        <div className="score-block">
            <span className="score-label"><Rvw>RVWD</Rvw> score</span>
            <Score score={album.score} variant="white" input={false} />
        </div>
    );

    const stats = (
        <ProfileStats
            minutes={album.stats.minutes}
            songs={album.songs.length}
            favs={album.stats.favs}
            rvws={album.stats.rvws}
        />
    );

    const rvwButton = (
        <Button variant="primary" className="rvw-action-btn" onClick={() => openAdd({ type: 'album', id: album.id })}>
            <Rvw>RVW</Rvw>
        </Button>
    );

    return (
        <div className="album-page-container">
            <Breadcrumbs items={breadcrumbs} />

            {/* Escritorio y tablet */}
            <div className="desktop-album-view">
                <div className="album-header-desktop">
                    {/* Decorativa: el nombre ya va en el h1 */}
                    <img src={album.coverUrl} alt="" className="album-cover-desktop" />
                    <div className="album-info-desktop">
                        <div className="album-title-row">
                            <div>
                                {nameRow}
                                {artistLink}
                            </div>
                            {scoreBlock}
                        </div>
                        <div className="album-stats-row">
                            {stats}
                            {rvwButton}
                        </div>
                    </div>
                </div>
                <div className="album-sections">
                    {sections.map((section) => (
                        <section key={section.key} className="album-section" aria-labelledby={`album-${section.key}-desktop`}>
                            <h2 id={`album-${section.key}-desktop`} className="section-title">{section.title}</h2>
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
            <div className="mobile-album-view">
                <div className="mobile-album-hero">
                    <img src={album.coverUrl} alt="" className="mobile-hero-bg" />
                    <div className="mobile-hero-gradient"></div>
                </div>
                <div className="mobile-album-content">
                    <div className="mobile-album-title">
                        {nameRow}
                        {artistLink}
                    </div>
                    {stats}
                    <div className="mobile-score-action">
                        {scoreBlock}
                        {rvwButton}
                    </div>
                    {/* Listados en carrusel */}
                    <div className="album-sections-mobile">
                        {sections.map((section) => (
                            <section key={section.key} className="album-section" aria-labelledby={`album-${section.key}-mobile`}>
                                <h2 id={`album-${section.key}-mobile`} className="section-title album-section-title">{section.title}</h2>
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

function AlbumRoute() {
    const { id } = useParams<{ id: string }>();
    // key: al pasar de un álbum a otro el estado empieza de cero
    return <AlbumContent key={id} id={id} />;
}

export default function AlbumPage() {
    // Con cacheComponents, useParams necesita un Suspense alrededor
    return (
        <Suspense
            fallback={
                <div className="helper-wrapper">
                    <span className="helper-text">Cargando álbum...</span>
                </div>
            }
        >
            <AlbumRoute />
        </Suspense>
    );
}
