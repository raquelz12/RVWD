'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '../../../../components/Button/Button';
import Score from '../../../../components/Score/Score';
import './song.css';
import MediaCard from '../../../../components/MediaCard/MediaCard';
import Carousel from '../../../../components/Carousel/Carousel';
import ProfileStats from '../../../../components/ProfileStats/ProfileStats';
import Breadcrumbs from '../../../../components/Breadcrumbs/Breadcrumbs';
import { generateBreadcrumbs } from '@/utils/breadcrumbs';
import { getSongDetails } from '@/lib/api';
import { Song } from '@/types/music';
import SearchBar from '../../../../components/SearchBar/SearchBar';

function SongContent() {
    const params = useParams();
    const router = useRouter();

    const [song, setSong] = useState<Song | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSong = async () => {
            if (params.id) {
                const data = await getSongDetails(params.id as string);
                setSong(data);
            }
            setIsLoading(false);
        };
        
        fetchSong();
    }, [params.id]);

    if (isLoading) {
        return <div className="helper-wrapper">
                    <span className="helper-text">Cargando canción...</span>
                </div>;
    }

    if (!song) {
        return <div className="helper-wrapper">
                    <span className="helper-text">Canción no encontrada</span>
                    <SearchBar placeholder="Busca otra canción..." />
                </div>;
    }

    const breadcrumbs = generateBreadcrumbs('song', song);
    const topRvws = [1, 2, 3, 4];

    return (
        <div className="song-page-container">
            <Breadcrumbs items={breadcrumbs} />
            <div className="desktop-song-view">
                <div className="song-header-desktop">
                    <img src={song.coverUrl} alt="Portada" className="song-cover-desktop" />
                    <div className="song-info-desktop">
                        <div className="song-title-row">
                            <div>
                                <span className="song-title">{song.name} <img src="/star-regular-full.svg" alt="Estrella" className="star-icon" /></span>
                                <a href={`/artist/${song.artist.id}`} className="song-artist">
                                    {song.artist.name}
                                </a>
                            </div>
                            <div className="song-score-action">
                                <div className="score-block">
                                    <span className="score-label"><span className="RVWS">RVWD</span>score</span>
                                    <Score score={song.score} variant="white" input={false} />
                                </div>
                            </div>
                        </div>
                        <div className="song-stats-row">
                            <ProfileStats 
                                minutes={song.stats.minutes} 
                                favs={song.stats.favs} 
                                rvws={song.stats.rvws} 
                            />
                            <Button variant="primary" className="rvw-action-btn"><span className="RVWS">RVW</span></Button>
                        </div>
                    </div>
                </div>
                {/* Listados PC */}
                <div className="song-sections">
                    <div className="song-section">
                        <span className="song-section-title">Top <span className="RVWS">RVWS</span></span>
                        <div className="cards-grid">
                            {topRvws.map((item, index) => (
                                <MediaCard
                                    key={index}
                                    type="cancion"
                                    title={song.name}
                                    artist={song.artist.name}
                                    imageUrl={song.coverUrl}
                                    userName="@raquelz.12204"
                                    userPicture="/placeholderCards.png"
                                    score={8.5}
                                    forceShowInfo={true}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Movil */}
            <div className="mobile-song-view">
                <div className="mobile-song-hero">
                    <img src={song.coverUrl} alt="Portada" className="mobile-hero-bg" />
                    <div className="mobile-hero-gradient"></div>
                </div>
                <div className="mobile-song-content">
                    <div className="mobile-song-title">
                        <span className="song-title">{song.name} <img src="/star-regular-full.svg" alt="Estrella" className="star-icon" /></span>
                        <span className="song-subtitle">{song.artist.name}</span>
                    </div>
                    <ProfileStats 
                        minutes={song.stats.minutes} 
                        favs={song.stats.favs} 
                        rvws={song.stats.rvws} 
                    />
                    <div className="mobile-score-action">
                        <div className="score-block">
                            <span className="score-label"><span className="RVWS">RVWD</span>score</span>
                            <Score score={song.score} variant="white" input={false} />
                        </div>
                        <Button variant="primary" className="rvw-action-btn"><span className="RVWS">RVW</span></Button>
                    </div>
                    {/* Listados Móvil (Scroll Horizontal) */}
                    <div className="song-sections-mobile">
                        <div className="song-section">
                            <span className="song-section-title">Top <span className="RVWS">RVWS</span></span>
                            <Carousel>
                                {topRvws.map((item, index) => (
                                    <MediaCard
                                        key={index}
                                        type="cancion"
                                        title={song.name}
                                        artist={song.artist.name}
                                        imageUrl={song.coverUrl}
                                        userName="@raquelz.12204"
                                        userPicture="/placeholderCards.png"
                                        score={8.5}
                                        forceShowInfo={true}
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

export default function SongPage() {
    return (
        <Suspense fallback={<div className="helper-wrapper" style={{ padding: '4rem', color: 'white', textAlign: 'center' }}>Cargando canción...</div>}>
            <SongContent />
        </Suspense>
    );
}