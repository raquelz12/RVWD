'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import SearchBar from '../../../../components/SearchBar/SearchBar';
import FavButton from '../../../../components/FavButton/FavButton';
import Link from 'next/link';

function ArtistContent() {
    const params = useParams();
    const router = useRouter();

    const [artist, setArtist] = useState<Artist | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchArtist = async () => {
            if (params.id) {
                const data = await getArtistDetails(params.id as string);
                setArtist(data);
            }
            setIsLoading(false);
        };
        
        fetchArtist();
    }, [params.id]);

    if (isLoading) {
        return <div className="helper-wrapper">
                    <span className="helper-text">Cargando artista...</span>
                    <SearchBar placeholder="Busca otro artista..." />
                </div>;
    }

    if (!artist) {
        return <div className="helper-wrapper">
                    <span className="helper-text">Artista no encontrado</span>
                    <SearchBar placeholder="Busca otro artista..." />
                </div>;
    }

    const breadcrumbs = generateBreadcrumbs('artist', artist);
    const topRvws = [1, 2, 3, 4];

    // Tarjetas reales del artista: las mismas en escritorio y en móvil
    const albumCards = artist.albums.map((album) => (
        <Link href={`/album/${album.id}`} key={album.id} className="media-card-link">
            <MediaCard
                type="album"
                title={album.name}
                artist={artist.name}
                imageUrl={album.coverUrl}
                score={album.score}
                forceShowInfo={true}
                scoreType="white"
            />
        </Link>
    ));

    const songCards = artist.songs.map((song) => (
        <Link href={`/song/${song.id}`} key={song.id} className="media-card-link">
            <MediaCard
                type="cancion"
                title={song.name}
                artist={artist.name}
                imageUrl={song.coverUrl}
                score={song.score}
                forceShowInfo={true}
                scoreType="white"
            />
        </Link>
    ));

    return (
        <div className="artist-page-container">
            <Breadcrumbs items={breadcrumbs} />
            <div className="desktop-artist-view">
                <div className="artist-header-desktop">
                    <img src={artist.pictureUrl} alt="Portada" className="artist-cover-desktop" />
                    <div className="artist-info-desktop">
                        <div className="artist-title-row">
                            <div>
                                <h1 className="artist-title">{artist.name} <FavButton itemLabel={artist.name} className="title-fav-btn" /> <img src="/bell-regular-full.svg" alt="Campana" className="bell-icon" /></h1>
                                <span className="artist-subtitle">Artista</span>
                            </div>
                            <div className="artist-score-action">
                                <div className="score-block">
                                    <span className="score-label"><span className="RVWS">RVWD</span> score</span>
                                    <Score score={artist.score} variant="white" input={false} />
                                </div>
                            </div>
                        </div>
                        <div className="artist-stats-row">
                            <ProfileStats
                                followers={artist.stats.followers}
                                favs={artist.stats.favs}
                                rvws={artist.stats.rvws}
                            />
                            <div className="artist-actions">
                                <Button variant="primary" className="artist-follow-btn">Seguir</Button>
                                <Button variant="primary" className="rvw-action-btn"><span className="RVWS">RVW</span></Button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Listados PC */}
                <div className="artist-sections">
                    <div className="artist-section">
                        <h2 className="section-title artist-section-title">Top <span className="RVWS">RVWS</span></h2>
                        <div className="cards-grid">
                            {topRvws.map((item, index) => (
                                <MediaCard
                                    key={index}
                                    type="cancion"
                                    title="No pasa nada hombre"
                                    artist={artist.name}
                                    imageUrl="/placeholderCards.png"
                                    userName="@raquelz.12204"
                                    userPicture="/placeholderCards.png"
                                    score={8.5}
                                    forceShowInfo={true}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="artist-section">
                        <h2 className="section-title artist-section-title">Top álbumes</h2>
                        <div className="cards-grid">
                            {albumCards}
                        </div>
                    </div>
                    <div className="artist-section">
                        <h2 className="section-title artist-section-title">Top canciones</h2>
                        <div className="cards-grid">
                            {songCards}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Movil */}
            <div className="mobile-artist-view">
                <div className="mobile-artist-hero">
                    <img src={artist.pictureUrl} alt="Portada" className="mobile-hero-bg" />
                    <div className="mobile-hero-gradient"></div>
                </div>
                <div className="mobile-artist-content">
                    <div className="mobile-artist-title">
                        <h1 className="artist-title">{artist.name} <FavButton itemLabel={artist.name} className="title-fav-btn" /> <img src="/bell-regular-full.svg" alt="Campana" className="bell-icon" /></h1>
                        <span className="artist-subtitle">Artista</span>
                    </div>
                    <ProfileStats
                        followers={artist.stats.followers}
                        favs={artist.stats.favs}
                        rvws={artist.stats.rvws}
                    />
                    <div className="mobile-score-action">
                        <div className="score-block">
                            <span className="score-label"><span className="RVWS">RVWD</span> score</span>
                            <Score score={artist.score} variant="white" input={false} />
                        </div>
                        <div className="artist-actions">
                            <Button variant="primary" className="artist-follow-btn">Seguir</Button>
                            <Button variant="primary" className="rvw-action-btn"><span className="RVWS">RVW</span></Button>
                        </div>
                    </div>
                    {/* Listados Móvil (Scroll Horizontal) */}
                    <div className="artist-sections-mobile">
                        <div className="artist-section">
                            <h2 className="section-title artist-section-title">Top <span className="RVWS">RVWS</span></h2>
                            <Carousel>
                                {topRvws.map((item, index) => (
                                    <MediaCard
                                        key={index}
                                        type="cancion"
                                        title="No pasa nada hombre"
                                        artist={artist.name}
                                        imageUrl="/placeholderCards.png"
                                        userName="@raquelz.12204"
                                        userPicture="/placeholderCards.png"
                                        score={8.5}
                                        forceShowInfo={true}
                                    />
                                ))}
                            </Carousel>
                        </div>
                        <div className="artist-section">
                            <h2 className="section-title artist-section-title">Top álbumes</h2>
                            <Carousel>
                                {albumCards}
                            </Carousel>
                        </div>
                        <div className="artist-section">
                            <h2 className="section-title artist-section-title">Top canciones</h2>
                            <Carousel>
                                {songCards}
                            </Carousel>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default function ArtistPage() {
    return (
        <Suspense fallback={<div className="helper-wrapper" style={{ padding: '4rem', color: 'white', textAlign: 'center' }}>Cargando artista...</div>}>
            <ArtistContent />
        </Suspense>
    );
}