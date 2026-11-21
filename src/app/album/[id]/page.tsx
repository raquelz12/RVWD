'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import SearchBar from '../../../../components/SearchBar/SearchBar';
import FavButton from '../../../../components/FavButton/FavButton';
import Link from 'next/link';

function AlbumContent() {
    const params = useParams();

    const [album, setAlbum] = useState<Album | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAlbum = async () => {
            if (params.id) {
                const data = await getAlbumDetails(params.id as string);
                setAlbum(data);
            }
            setIsLoading(false);
        };
        
        fetchAlbum();
    }, [params.id]);

    if (isLoading) {
        return <div className="helper-wrapper">
                    <span className="helper-text">Cargando álbum...</span>{/*Ya hare un skeleton para esto*/}
                </div>;
    }

    if (!album) {
        return <div className="helper-wrapper">
                    <span className="helper-text">Álbum no encontrado</span>
                    <SearchBar placeholder="Busca otro álbum..." />
                </div>;
    }

    const breadcrumbs = generateBreadcrumbs('album', album);

    const topRvws = [1, 2, 3, 4];

    return (
        <div className="album-page-container">
            <Breadcrumbs items={breadcrumbs} />
            {/* Escritorio */}
            <div className="desktop-album-view">
                <div className="album-header-desktop">
                    <img src={album.coverUrl} alt="Portada" className="album-cover-desktop" />
                    <div className="album-info-desktop">
                        <div className="album-title-row">
                            <div>
                                <h1 className="album-title">{album.name} <FavButton itemLabel={album.name} className="title-fav-btn" /></h1>
                                <a href={`/artist/${album.artist.id}`} className="album-artist">{album.artist.name}</a>
                            </div>
                            <div className="album-score-action">
                                <div className="score-block">
                                    <span className="score-label"><span className="RVWS">RVWD</span> score</span>
                                    <Score score={album.score} variant="white" input={false} />
                                </div>
                            </div>
                        </div>
                        <div className="album-stats-row">
                            <ProfileStats 
                                minutes={album.stats.minutes} 
                                songs={album.songs.length} 
                                favs={album.stats.favs} 
                                rvws={album.stats.rvws} 
                            />
                            <Button variant="primary" className="rvw-action-btn"><span className="RVWS">RVW</span></Button>
                        </div>
                    </div>
                </div>
                {/* Listados PC */}
                <div className="album-sections">
                    <div className="album-section">
                        <h2 className="section-title album-section-title">Top <span className="RVWS">RVWS</span></h2>
                        <div className="cards-grid">
                            {topRvws.map((item, index) => (
                                <MediaCard
                                    key={index}
                                    type="album"
                                    title={album.name}
                                    artist={album.artist.name}
                                    imageUrl={album.coverUrl}
                                    userName="@raquelz.12204"
                                    userPicture="/placeholderCards.png"
                                    score={8.5}
                                    forceShowInfo={true}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="album-section">
                        <h2 className="section-title album-section-title">Top canciones</h2>
                        <div className="cards-grid">
                            {album.songs.map((song) => (
                                <Link href={`/song/${song.id}`} key={song.id} className="media-card-link">
                                    <MediaCard
                                        type="cancion"
                                        title={song.name}
                                        artist={song.artist.name}
                                        imageUrl={album.coverUrl}
                                        score={song.score}
                                        forceShowInfo={true}
                                        scoreType="white"
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Movil */}
            <div className="mobile-album-view">
                <div className="mobile-album-hero">
                    <img src={album.coverUrl} alt="Portada" className="mobile-hero-bg" />
                    <div className="mobile-hero-gradient"></div>
                </div>
                <div className="mobile-album-content">
                    <div className="mobile-album-title">
                        <h1 className="album-title">{album.name} <FavButton itemLabel={album.name} className="title-fav-btn" /></h1>
                        <a href={`/artist/${album.artist.id}`} className="album-artist">{album.artist.name}</a>
                    </div>
                    <ProfileStats 
                        minutes={album.stats.minutes} 
                        songs={album.songs.length} 
                        favs={album.stats.favs} 
                        rvws={album.stats.rvws} 
                    />
                    <div className="mobile-score-action">
                        <div className="score-block">
                            <span className="score-label"><span className="RVWS">RVWD</span> score</span>
                            <Score score={album.score} variant="white" input={false} />
                        </div>
                        <Button variant="primary" className="rvw-action-btn"><span className="RVWS">RVW</span></Button>
                    </div>
                    {/* Listados Móvil (Scroll Horizontal) */}
                    <div className="album-sections-mobile">
                        <div className="album-section">
                            <h2 className="section-title album-section-title">Top <span className="RVWS">RVWS</span></h2>
                            <Carousel>
                                {topRvws.map((item, index) => (
                                    <MediaCard
                                        key={index}
                                        type="album"
                                        title={album.name}
                                        artist={album.artist.name}
                                        imageUrl={album.coverUrl}
                                        userName="@raquelz.12204"
                                        userPicture="/placeholderCards.png"
                                        score={8.5}
                                        forceShowInfo={true}
                                    />
                                ))}
                            </Carousel>
                        </div>
                        <div className="album-section">
                            <h2 className="section-title album-section-title">Top canciones</h2>
                            <Carousel>
                                {album.songs.map((song) => (
                                    <Link href={`/song/${song.id}`} key={song.id} className="media-card-link">
                                        <MediaCard
                                            type="cancion"
                                            title={song.name}
                                            artist={song.artist.name}
                                            imageUrl={album.coverUrl}
                                            score={song.score}
                                            forceShowInfo={true}
                                            scoreType="white"
                                        />
                                    </Link>
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