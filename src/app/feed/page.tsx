import React, { Suspense } from 'react';
import SmallCard from '../../../components/SmallCard/SmallCard';
import Button from '../../../components/Button/Button';
import './feed.css';
import ReviewBigCard from '../../../components/ReviewBigCard/ReviewBigCard';
import ArtistCard from '../../../components/ArtistCard/ArtistCard';
import MediaCard from '../../../components/MediaCard/MediaCard';
import FeedTabs from '../../../components/FeedTabs/FeedTabs';
import Link from 'next/link';

export const instant = false;

export default async function Feed({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
    const resolvedParams = await searchParams;
    const currentTab = resolvedParams.tab || 'para-ti';

    return (
        <div className="feed-container">
            <Suspense fallback={<div className="feed-buttons-skeleton">Cargando...</div>}>
                <FeedTabs />
            </Suspense>
            {currentTab === 'para-ti' ? (
                <div className="feed">
                    <div className="feed-main-column">
                        <div className="show-new">
                            <img src="/arrow-up-long-solid-full.svg" alt="Flecha" />
                            <span className="RVWS">RVWS</span> nuevas
                        </div>
                        <Link href="/reviews/123" style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
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
                                <h3 className="title">Artistas que te podrían gustar</h3>
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
                                <h3 className="title">Reseñas favoritas para ti</h3>
                                <Button variant="text">Ver más</Button>
                            </div>
                            <div className="fav-reviews-for-you-cards">
                                <MediaCard type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" score={8.5} />
                                <MediaCard type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" score={8.5} />
                                <MediaCard type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" score={8.5} />
                            </div>
                        </div>
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
                    </div>
                    <div className="feed-side-column">
                        <input type="checkbox" id="releases-toggle" className="releases-toggle-checkbox" />
                        <label htmlFor="releases-toggle" className="drawer-overlay"></label>
                        <label htmlFor="releases-toggle" className="floating-releases-btn">
                            <img src="/fire-solid-full.svg" alt="Nuevos lanzamientos" />
                        </label>
                        <div className="mobile-releases-drawer">
                            <div className="drawer-header">
                                <h3 className="feed-side-title">Nuevos lanzamientos</h3>
                                <label htmlFor="releases-toggle" className="close-drawer-btn">
                                    ✕
                                </label>
                            </div>
                            <div className="new-releases-cards">
                                <SmallCard type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" />
                                <SmallCard type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" />
                                <SmallCard type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" />
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
                                    <h3 className="title">Top de la semana</h3>
                                    <Button variant="text">Ver más</Button>
                                </div>
                                <div className="weekly-top-cards-list">
                                    <span className="weekly-top-card">
                                        <span className="weekly-top-card-number">1</span>
                                        <SmallCard variant="large" type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" score={8.5} />
                                    </span>
                                    <span className="weekly-top-card">
                                        <span className="weekly-top-card-number">2</span>
                                        <SmallCard variant="large" type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" score={8.5} />
                                    </span>
                                    <span className="weekly-top-card">
                                        <span className="weekly-top-card-number">3</span>
                                        <SmallCard variant="large" type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" score={8.5} />
                                    </span>
                                </div>
                            </div>
                            <div className="favorite-weekly-rvws-section">
                                <div className="section-header">
                                    <h3 className="title">Reseñas favoritas de la semana</h3>
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
                                    <h3 className="title">Tienes mucho en común con...</h3>
                                    <Button variant="text">Ver más</Button>
                                </div>
                                <div className="users-cards">
                                    <div className="user-card">
                                        <img src="/placeholderCards.png" alt="Usuario" className="user-image" />
                                        <div className="user-info">
                                            <span className="username">@raquelz.12204</span>
                                            <span className="name">Raquel Z.</span>
                                        </div>
                                        <Button variant="primary">Seguir</Button>
                                    </div>
                                    <div className="user-card">
                                        <img src="/placeholderCards.png" alt="Usuario" className="user-image" />
                                        <div className="user-info">
                                            <span className="username">@raquelz.12204</span>
                                            <span className="name">Raquel Z.</span>
                                        </div>
                                        <Button variant="primary">Seguir</Button>
                                    </div>
                                    <div className="user-card">
                                        <img src="/placeholderCards.png" alt="Usuario" className="user-image" />
                                        <div className="user-info">
                                            <span className="username">@raquelz.12204</span>
                                            <span className="name">Raquel Z.</span>
                                        </div>
                                        <Button variant="primary">Seguir</Button>
                                    </div>
                                    <div className="user-card">
                                        <img src="/placeholderCards.png" alt="Usuario" className="user-image" />
                                        <div className="user-info">
                                            <span className="username">@raquelz.12204</span>
                                            <span className="name">Raquel Z.</span>
                                        </div>
                                        <Button variant="primary">Seguir</Button>
                                    </div>
                                </div>
                            </div>
                            <div className="rvws-discover-section">
                                <div className="section-header">
                                    <h3 className="title">RVWS que podrían gustarte</h3>
                                    <Button variant="text">Ver más</Button>
                                </div>
                                <div className="rvws-discover-cards">
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
                                <h3 className="feed-side-title">Novedades</h3>
                                <label htmlFor="releases-toggle" className="close-drawer-btn">
                                    ✕
                                </label>
                            </div>
                            <div className="new-releases-cards">
                                <div className="discovery-card">
                                    <p>Gracias a vuestras sugerencias, ya se pueden guardar reseñas.</p>
                                    <a href="/sugerencias" className="discovery-link">
                                        Ver sugerencias hechas
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}