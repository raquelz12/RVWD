import React from 'react';
import SmallCard from '../../../components/SmallCard/SmallCard';
import Button from '../../../components/Button/Button';
import './feed.css';
import ReviewBigCard from '../../../components/ReviewBigCard/ReviewBigCard';
import ArtistCard from '../../../components/ArtistCard/ArtistCard';
import MediaCard from '../../../components/MediaCard/MediaCard';
import FeedTabs, { type FeedTab } from '../../../components/FeedTabs/FeedTabs';
import SideDrawer from '../../../components/SideDrawer/SideDrawer';
import Link from 'next/link';
import { mockAlbums } from '../lib/mockData';
import Rvw from '../../../components/Rvw/Rvw';
import { userHref } from '../lib/publicUsers';

// TODO: vendrán del backend
const SIMILAR_USERS = [
    { username: '@lucia.music', name: 'Lucía Martín' },
    { username: '@clarent', name: 'Clarent' },
    { username: '@juanp', name: 'Juan Pérez' },
    { username: '@sara.vinilos', name: 'Sara Vidal' },
];

export const instant = false;

export default async function Feed({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
    const resolvedParams = await searchParams;
    const currentTab: FeedTab = resolvedParams.tab === 'descubrir' ? 'descubrir' : 'para-ti';

    return (
        <div className="feed-container">
            <h1 className="sr-only">Feed</h1>
            <FeedTabs currentTab={currentTab} />
            {currentTab === 'para-ti' ? (
                <div className="feed">
                    <div className="feed-main-column">
                        <Link href="/feed" className="show-new">
                            <img src="/arrow-up-long-solid-full.svg" alt="" />
                            <Rvw>RVWS</Rvw> nuevas
                        </Link>
                        <ReviewBigCard
                            href="/reviews/123"
                            mediaHref="/album/123"
                            reviewId="123"
                            username="@clarent"
                            userHref={userHref('@clarent')}
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
                        <section className="feed-section">
                            <h2 className="section-title">Artistas que te podrían gustar</h2>
                            <div className="might-like-cards">
                                <ArtistCard href="/artist/123" name="Clarent" hasScore={true} showFollow={true} score={8.5} variant="white" />
                                <ArtistCard href="/artist/123" name="Clarent" hasScore={true} showFollow={true} score={9.5} variant="white" />
                                <ArtistCard href="/artist/123" name="Clarent" hasScore={true} showFollow={true} score={7.8} variant="white" />
                                <ArtistCard href="/artist/123" name="Clarent" hasScore={true} showFollow={true} score={9.4} variant="white" />
                            </div>
                        </section>
                        <section className="feed-section">
                            <h2 className="section-title"><Rvw>RVWS</Rvw> favoritas para ti</h2>
                            <div className="media-cards-row">
                                <MediaCard href="/reviews/123" type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" userName="@raquelz.12204" userPicture="/placeholderCards.png" score={8.5} />
                                <MediaCard href="/reviews/123" type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" userName="@raquelz.12204" userPicture="/placeholderCards.png" score={8.5} />
                                <MediaCard href="/reviews/123" type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" userName="@raquelz.12204" userPicture="/placeholderCards.png" score={8.5} />
                            </div>
                        </section>
                        <ReviewBigCard
                            href="/reviews/123"
                            mediaHref="/album/123"
                            reviewId="123"
                            username="@sara.vinilos"
                            userHref={userHref('@sara.vinilos')}
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
                    <SideDrawer title="Nuevos lanzamientos" icon="/fire-solid-full.svg">
                        {mockAlbums.map((album) => (
                            <Link key={album.id} href={`/album/${album.id}`}>
                                <SmallCard
                                    type="album"
                                    title={album.name}
                                    artist={album.artist.name}
                                    imageUrl={album.coverUrl}
                                />
                            </Link>
                        ))}
                    </SideDrawer>
                </div>
            ) : (
                // ----------------------------DESCUBRIR TAB----------------------------
                <div className="feed">
                    {/* ----------------------------COLUMNA PRINCIPAL---------------------------- */}
                    <div className="feed-main-column">
                        <section className="feed-section">
                            <div className="buttons-container">
                                <Button variant="primary">Todo</Button>
                                <Button variant="outline">Canciones</Button>
                                <Button variant="outline">Álbumes</Button>
                                <Button variant="outline">Artistas</Button>
                            </div>
                            <h2 className="section-title">Top de la semana</h2>
                            <ol className="weekly-top-cards-list">
                                {[1, 2, 3].map((position) => (
                                    <li key={position} className="weekly-top-card">
                                        <span className="weekly-top-card-number">{position}</span>
                                        <Link href="/album/123" className="weekly-top-link">
                                            <SmallCard variant="large" type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" score={8.5} />
                                        </Link>
                                    </li>
                                ))}
                            </ol>
                        </section>
                        <section className="feed-section">
                            <h2 className="section-title"><Rvw>RVWS</Rvw> favoritas de la semana</h2>
                            <div className="media-cards-row">
                                <MediaCard href="/reviews/123" type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" userName="@raquelz.12204" userPicture="/placeholderCards.png" score={8.5} />
                                <MediaCard href="/reviews/123" type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" userName="@raquelz.12204" userPicture="/placeholderCards.png" score={8.5} />
                                <MediaCard href="/reviews/123" type="album" title="No pasa nada hombre" artist="Clarent" imageUrl="/placeholderCards.png" userName="@raquelz.12204" userPicture="/placeholderCards.png" score={8.5} />
                            </div>
                        </section>
                        <section className="feed-section">
                            <h2 className="section-title">Tienes mucho en común con...</h2>
                            <div className="users-cards">
                                {SIMILAR_USERS.map((user) => (
                                    <div key={user.username} className="user-card">
                                        <Link href={userHref(user.username)} className="user-card-link">
                                            <img src="/placeholderCards.png" alt="" className="user-image" />
                                            <div className="user-info">
                                                <span className="username">{user.username}</span>
                                                <span className="name">{user.name}</span>
                                            </div>
                                        </Link>
                                        <Button variant="primary">Seguir</Button>
                                    </div>
                                ))}
                            </div>
                        </section>
                        <section className="feed-section">
                            <h2 className="section-title"><Rvw>RVWS</Rvw> que podrían gustarte</h2>
                            <ReviewBigCard
                                href="/reviews/123"
                                mediaHref="/album/123"
                                reviewId="123"
                                username="@juanp"
                                userHref={userHref('@juanp')}
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
                        </section>
                    </div>
                    {/* ----------------------------COLUMNA LATERAL---------------------------- */}
                    <SideDrawer title="Novedades" icon="/newspaper-solid-full.svg">
                        <div className="discovery-card">
                            <p>Gracias a vuestras sugerencias, ya se pueden guardar reseñas.</p>
                            <Link href="/suggestions" className="discovery-link">
                                Ver sugerencias hechas
                            </Link>
                        </div>
                    </SideDrawer>
                </div>
            )}
        </div>
    );
}
