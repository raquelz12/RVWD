'use client';

import { Suspense, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '../../../../components/Button/Button';
import Score from '../../../../components/Score/Score';
import './album.css';
import MediaCard from '../../../../components/MediaCard/MediaCard';
import Carousel from '../../../../components/Carousel/Carousel';
import ProfileStats from '../../../../components/ProfileStats/ProfileStats';

function AlbumContent() {
    const params = useParams();
    const router = useRouter();

    const albumData = {
        title: "No pasa nada hombre",
        artist: "Clarent",
        coverUrl: "/placeholderCards.png",
        stats: {
            minutes: 38,
            songs: 8,
            favs: 569,
            rvws: 124
        },
        score: 9.8
    };

    const topRvws = [1, 2, 3, 4];
    const topSongs = [1, 2, 3, 4];

    return (
        <div className="album-page-container">
            {/* Escritorio */}
            <div className="desktop-album-view">
                <div className="album-header-desktop">
                    <img src={albumData.coverUrl} alt="Portada" className="album-cover-desktop" />
                    <div className="album-info-desktop">
                        <div className="album-title-row">
                            <div>
                                <span className="album-title">{albumData.title} <img src="/star-regular-full.svg" alt="Estrella" className="star-icon" /></span>
                                <span className="album-artist">{albumData.artist}</span>
                            </div>
                            <div className="album-score-action">
                                <div className="score-block">
                                    <span className="score-label"><span className="RVWS">RVWD</span>score</span>
                                    <Score score={albumData.score} variant="white" input={false} />
                                </div>
                            </div>
                        </div>
                        <div className="album-stats-row">
                            <ProfileStats  minutes={albumData.stats.minutes} songs={albumData.stats.songs} favs={albumData.stats.favs} rvws={albumData.stats.rvws} />
                            <Button variant="primary" className="rvw-action-btn"><span className="RVWS">RVW</span></Button>
                        </div>
                    </div>
                </div>
                {/* Listados PC */}
                <div className="album-sections">
                    <div className="album-section">
                        <span className="album-section-title">Top <span className="RVWS">RVWS</span></span>
                        <div className="cards-grid">
                            {topRvws.map((item, index) => (
                                <MediaCard
                                    type="album"
                                    title="No pasa nada hombre"
                                    artist="Clarent"
                                    imageUrl="/placeholderCards.png"
                                    userName="@raquelz.12204"
                                    userPicture="/placeholderCards.png"
                                    score={8.5}
                                    forceShowInfo={true}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="album-section">
                        <span className="album-section-title">Top canciones</span>
                        <div className="cards-grid">
                            {topSongs.map((item, index) => (
                                <MediaCard
                                    type="cancion"
                                    title="Jukiar"
                                    artist="Clarent"
                                    imageUrl="/placeholderCards.png"
                                    score={8.5}
                                    forceShowInfo={true}
                                    scoreType="white"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Movil */}
            <div className="mobile-album-view">
                <div className="mobile-album-hero">
                    <img src={albumData.coverUrl} alt="Portada" className="mobile-hero-bg" />
                    <div className="mobile-hero-gradient"></div>
                </div>
                <div className="mobile-album-content">
                    <div className="mobile-album-title">
                        <span className="album-title">{albumData.title} <img src="/star-regular-full.svg" alt="Estrella" className="star-icon" /></span>
                        <span className="album-artist">{albumData.artist}</span>
                    </div>
                    <ProfileStats  minutes={albumData.stats.minutes} songs={albumData.stats.songs} favs={albumData.stats.favs} rvws={albumData.stats.rvws} />
                    <div className="mobile-score-action">
                        <div className="score-block">
                            <span className="score-label"><span className="RVWS">RVWD</span>score</span>
                            <Score score={albumData.score} variant="white" input={false} />
                        </div>
                        <Button variant="primary" className="rvw-action-btn"><span className="RVWS">RVW</span></Button>
                    </div>
                    {/* Listados Móvil (Scroll Horizontal) */}
                    <div className="album-sections-mobile">
                        <div className="album-section">
                            <span className="album-section-title">Top <span className="RVWS">RVWS</span></span>
                            <Carousel>
                                {topRvws.map((item, index) => (
                                    <MediaCard
                                        key={index}
                                        type="album"
                                        title="No pasa nada hombre"
                                        artist="Clarent"
                                        imageUrl="/placeholderCards.png"
                                        userName="@raquelz.12204"
                                        userPicture="/placeholderCards.png"
                                        score={8.5}
                                        forceShowInfo={true}
                                    />
                                ))}
                            </Carousel>
                        </div>
                        <div className="album-section">
                            <span className="album-section-title">Top canciones</span>
                            <Carousel>
                                {topSongs.map((item, index) => (
                                    <MediaCard
                                        type="cancion"
                                        title="Jukiar"
                                        artist="Clarent"
                                        imageUrl="/placeholderCards.png"
                                        score={8.5}
                                        forceShowInfo={true}
                                        scoreType="white"
                                    />
                                ))}
                            </Carousel>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default function AlbumPage() {
    return (
        <Suspense fallback={<div style={{ padding: '4rem', color: 'white', textAlign: 'center' }}>Cargando álbum...</div>}>
            <AlbumContent />
        </Suspense>
    );
}