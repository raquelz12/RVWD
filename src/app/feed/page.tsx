import React, { Suspense } from 'react';
import SmallCard from '../../../components/SmallCard/SmallCard';
import Button from '../../../components/Button/Button';
import './feed.css';
import ReviewBigCard from '../../../components/ReviewBigCard/ReviewBigCard';
import ArtistCard from '../../../components/ArtistCard/ArtistCard';
import MediaCard from '../../../components/MediaCard/MediaCard';
import FeedTabs from '../../../components/FeedTabs/FeedTabs';
import Link from 'next/link';
import { mockAlbums } from '../lib/mockData';

export const instant = false;

export default async function Feed({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
    const resolvedParams = await searchParams;
    const currentTab = resolvedParams.tab || 'para-ti';

    return (
        <div className="feed-container">
            {/* Mientras cargan las pestañas se ven ya con su forma (y la activa marcada), sin poder pulsarlas */}
            <Suspense fallback={
                <div className="feed-buttons">
                    <button className={currentTab === 'para-ti' ? 'feed-button active' : 'feed-button'} disabled>Para ti</button>
                    <button className={currentTab === 'descubrir' ? 'feed-button active' : 'feed-button'} disabled>Descubrir</button>
                </div>
            }>
                <FeedTabs />
            </Suspense>
            {currentTab === 'para-ti' ? (
                <div className="feed">
                    <div className="feed-main-column">
                        <div className="show-new">
                            <img src="/arrow-up-long-solid-full.svg" alt="Flecha" />
                            <span className="RVWS">RVWS</span> nuevas
                        </div>
                        <Link href="/reviews/123" className="feed-review-link">
                            <ReviewBigCard
                                username="@raquelz.12204"
                                userImageUrl="/placeholderCards.png"
                                followed={true}
                                type="Álbum"
                                title="No pasa nada hombre"
                                artist="Clarent"
                                imageUrl="/placeholderCards.png"
                                score={8.5}
                                titleReview="Mi opinión sobre este álbum"
                                reviewText="Este álbum es increíble. Toda la música es genial y los arreglos son perfectos."
                                reviewDate="2023-01-01"
                                commentsCount={10}
                                favoritesCount={5}
                            />
                        </Link>
                        <div className="might-like-section">
                            <div className="section-header">
                                <h3 className="title block-title">Artistas que te podrían gustar</h3>
                                <Button variant="text">Ver más</Button>
                            </div>
                            <div className="might-like-cards">
                                <ArtistCard name="Clarent" hasScore={true} isSelected={false} followed={true} score={8.5} variant="white" />
                                <ArtistCard name="Clarent" hasScore={true} isSelected={false} followed={true} score={9.5} variant="white" />
                                <ArtistCard name="Clarent" hasScore={true} isSelected={false} followed={true} score={7.8} variant="white" />
                                <ArtistCard name="Clarent" hasScore={true} isSelected={false} followed={true} score={9.4} variant="white" />
                            </div>
                        </div>
                        <div className="fav-reviews-for-you-section">
                            <div className="section-header">
                                <h3 className="title block-title"><span className="RVWS">RVWS</span> favoritas para ti</h3>
                                <Button variant="text">Ver más</Button>
                            </div>
                            <div className="fav-reviews-for-you-cards">
                                <MediaCard type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" score={8.5} />
                                <MediaCard type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" score={8.5} />
                                <MediaCard type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" score={8.5} />
                            </div>
                        </div>
                        <Link href="/reviews/123" className="feed-review-link">
                            <ReviewBigCard
                                username="@raquelz.12204"
                                userImageUrl="/placeholderCards.png"
                                followed={true}
                                type="Álbum"
                                title="No pasa nada hombre"
                                artist="Clarent"
                                imageUrl="/placeholderCards.png"
                                score={8.5}
                                titleReview="Mi opinión sobre este álbum"
                                reviewText="Este álbum es increíble. Toda la música es genial y los arreglos son perfectos."
                                reviewDate="2023-01-01"
                                commentsCount={10}
                                favoritesCount={5}
                            />
                        </Link>
                    </div>
                    <div className="feed-side-column">
                        <input type="checkbox" id="releases-toggle" className="releases-toggle-checkbox" />
                        <label htmlFor="releases-toggle" className="drawer-overlay"></label>
                        <label htmlFor="releases-toggle" className="floating-releases-btn">
                            <img src="/fire-solid-full.svg" alt="Nuevos lanzamientos" />
                        </label>
                        <div className="mobile-releases-drawer">
                            <div className="drawer-header">
                                <h3 className="block-title feed-side-title">Nuevos lanzamientos</h3>
                                <label htmlFor="releases-toggle" className="close-drawer-btn">
                                    ✕
                                </label>
                            </div>
                            <div className="new-releases-cards">
                                {mockAlbums.map((album) => (
                                    <Link 
                                        key={album.id} 
                                        href={`/album/${album.id}`} 
                                    >
                                        <SmallCard 
                                            type="album" 
                                            title={album.name} 
                                            artist={album.artist.name} 
                                            imageUrl={album.coverUrl} 
                                        />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // ----------------------------DESCUBRIR TAB----------------------------
                <div className="feed">
                    {/* ----------------------------COLUMNA PRINCIPAL---------------------------- */}
                    <div className="feed-main-column">
                        <div className="weekly-top-section">
                            <div className="buttons-container">
                                <Button variant="primary">Todo</Button>
                                <Button variant="outline">Canciones</Button>
                                <Button variant="outline">Álbumes</Button>
                                <Button variant="outline">Artistas</Button>
                            </div>
                            <div className="weekly-top-cards">
                                <div className="section-header">
                                    <h3 className="title block-title">Top de la semana</h3>
                                    <Button variant="text">Ver más</Button>
                                </div>
                                <div className="weekly-top-cards-list">
                                    <span className="weekly-top-card">
                                        <span className="weekly-top-card-number">1</span>
                                        <Link href="/album/123" className="weekly-top-link">
                                            <SmallCard variant="large" type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" score={8.5} />
                                        </Link>
                                    </span>
                                    <span className="weekly-top-card">
                                        <span className="weekly-top-card-number">2</span>
                                        <Link href="/album/123" className="weekly-top-link">
                                            <SmallCard variant="large" type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" score={8.5} />
                                        </Link>
                                    </span>
                                    <span className="weekly-top-card">
                                        <span className="weekly-top-card-number">3</span>
                                        <Link href="/album/123" className="weekly-top-link">
                                            <SmallCard variant="large" type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" score={8.5} />
                                        </Link>
                                    </span>
                                </div>
                            </div>
                            <div className="favorite-weekly-rvws-section">
                                <div className="section-header">
                                    <h3 className="title block-title"><span className="RVWS">RVWS</span> favoritas de la semana</h3>
                                    <Button variant="text">Ver más</Button>
                                </div>
                                <div className="favorite-weekly-rvws-cards">
                                    <MediaCard type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" score={8.5} />
                                    <MediaCard type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" score={8.5} />
                                    <MediaCard type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" score={8.5} />
                                </div>
                            </div>
                            <div className="users-section">
                                <div className="section-header">
                                    <h3 className="title block-title">Tienes mucho en común con...</h3>
                                    <Button variant="text">Ver más</Button>
                                </div>
                                <div className="users-cards">
                                    {/* Múltiples User Cards... */}
                                    <div className="user-card">
                                        {/* De momento al perfil propio: aún no hay página de perfil de otros usuarios */}
                                        <Link href="/profile" className="user-card-link">
                                            <img src="/placeholderCards.png" alt="Usuario" className="user-image" />
                                            <div className="user-info">
                                                <span className="username">@raquelz.12204</span>
                                                <span className="name">Raquel Z.</span>
                                            </div>
                                        </Link>
                                        <Button variant="primary">Seguir</Button>
                                    </div>
                                    <div className="user-card">
                                        {/* De momento al perfil propio: aún no hay página de perfil de otros usuarios */}
                                        <Link href="/profile" className="user-card-link">
                                            <img src="/placeholderCards.png" alt="Usuario" className="user-image" />
                                            <div className="user-info">
                                                <span className="username">@raquelz.12204</span>
                                                <span className="name">Raquel Z.</span>
                                            </div>
                                        </Link>
                                        <Button variant="primary">Seguir</Button>
                                    </div>
                                </div>
                            </div>
                            <div className="rvws-discover-section">
                                <div className="section-header">
                                    <h3 className="title block-title"><span className="RVWS">RVWS</span> que podrían gustarte</h3>
                                    <Button variant="text">Ver más</Button>
                                </div>
                                <div className="rvws-discover-cards">
                                    <Link href="/reviews/123" className="feed-review-link">
                                        <ReviewBigCard
                                            username="@raquelz.12204"
                                            userImageUrl="/placeholderCards.png"
                                            followed={false}
                                            type="Álbum"
                                            title="No pasa nada hombre"
                                            artist="Clarent"
                                            imageUrl="/placeholderCards.png"
                                            score={8.5}
                                            titleReview="Mi opinión sobre este álbum"
                                            reviewText="Este álbum es increíble. Toda la música es genial y los arreglos son perfectos."
                                            reviewDate="2023-01-01"
                                            commentsCount={10}
                                            favoritesCount={5}
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ----------------------------COLUMNA LATERAL---------------------------- */}
                    <div className="feed-side-column">
                        <input type="checkbox" id="releases-toggle" className="releases-toggle-checkbox" />
                        <label htmlFor="releases-toggle" className="drawer-overlay"></label>
                        <label htmlFor="releases-toggle" className="floating-releases-btn">
                            <img src="/newspaper-solid-full.svg" alt="Novedades" />
                        </label>
                        <div className="mobile-releases-drawer">
                            <div className="drawer-header">
                                <h3 className="block-title feed-side-title">Novedades</h3>
                                <label htmlFor="releases-toggle" className="close-drawer-btn">
                                    ✕
                                </label>
                            </div>
                            <div className="new-releases-cards">
                                <div className="discovery-card">
                                    <p>Gracias a vuestras sugerencias, ya se pueden guardar reseñas.</p>
                                    <Link href="/suggestions" className="discovery-link">
                                        Ver sugerencias hechas
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}