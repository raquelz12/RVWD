'use client';

import MediaCard from '../../../components/MediaCard/MediaCard';
import Button from '../../../components/Button/Button';
import ReviewBigCard from '../../../components/ReviewBigCard/ReviewBigCard';
import SearchBar from '../../../components/SearchBar/SearchBar';
import './profile.css';
import { useState, useRef } from 'react';
import Input from '../../../components/Input/Input';
import TextArea from '../../../components/TextArea/TextArea';

export default function ProfilePage() {

    const ownProfile = true;

    const [isEditing, setIsEditing] =  useState(false);

    const [profileData, setProfileData] = useState({
        name: 'Raquel Arnaiz Mínguez',
        /* No se si en un futuro se puede cambiar el username desde aqui, pero por ahora lo dejo así */
        username: '@raquelz.12204',
        bio: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.',
        topSongs: [
            { id: 1, type: "cancion" as const, title: "Jukiar 1", artist: "Clarent", imageUrl: "/placeholderCards.png" },
            { id: 2, type: "cancion" as const, title: "Jukiar 2", artist: "Clarent", imageUrl: "/placeholderCards.png" },
            null,
            { id: 4, type: "cancion" as const, title: "Jukiar 4", artist: "Clarent", imageUrl: "/placeholderCards.png" }
        ]
    });

    const [backupData, setBackupData] = useState(profileData);

    const [activeSearchSlot, setActiveSearchSlot] = useState<number | null>(null);
    const [songSearchQuery, setSongSearchQuery] = useState('');
    const [removingSlot, setRemovingSlot] = useState<number | null>(null);
    const [closingSlot, setClosingSlot] = useState<number | null>(null);

    const searchResultsSongs = [
        { title: "Nueva Canción 1", artist: "Artista Top", imageUrl: "/placeholderCards.png" },
        { title: "Otra Canción", artist: "Banda Genial", imageUrl: "/placeholderCards.png" }
    ];

    const handleEditToggle = () => {
        setBackupData(JSON.parse(JSON.stringify(profileData)));
        setIsEditing(!isEditing);
    }

    const handleCancel = () => {
        setProfileData(backupData);
        setActiveSearchSlot(null);
        setIsEditing(false);
    };

    const handleSave = () => {
        setIsEditing(false);
        setActiveSearchSlot(null);
        //Al backend
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRemoveSong = (indexToRemove: number) => {
        setRemovingSlot(indexToRemove);
        setTimeout(() => {
            setProfileData(prev => {
                const newSongs = [...prev.topSongs];
                newSongs[indexToRemove] = null as any; 
                return { ...prev, topSongs: newSongs };
            });
            setRemovingSlot(null);
        }, 400);
    };

    const handleCancelSearch = (index: number) => {
        setClosingSlot(index);
        setTimeout(() => {
            setActiveSearchSlot(null);
            setClosingSlot(null);
            setSongSearchQuery('');
        }, 400);
    };

    const handleSelectSong = (resultSong: any, index: number) => {
        setProfileData(prev => {
            const newSongs = [...prev.topSongs];
            newSongs[index] = { 
                id: Math.random(), 
                type: "cancion", 
                title: resultSong.title, 
                artist: resultSong.artist, 
                imageUrl: resultSong.imageUrl 
            };
            return { ...prev, topSongs: newSongs };
        });
        setActiveSearchSlot(null);
        setSongSearchQuery('');
    };

    /* Estados carrousel y cosas de animación */

    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);
    const paginationLetters = ['Я', 'V', 'W', 'D'];

    const handleScroll = () => {
        if (carouselRef.current) {
            const scrollLeft = carouselRef.current.scrollLeft;
            const width = carouselRef.current.offsetWidth;
            const index = Math.round(scrollLeft / width);
            setActiveIndex(index);
        }
    };

    const scrollToCard = (index: number) => {
        if (carouselRef.current) {
            const width = carouselRef.current.offsetWidth;
            carouselRef.current.scrollTo({
                left: width * index,
                behavior: 'smooth',
            });
            setActiveIndex(index);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <span className="profile-header-title">Tu perfil de <span className="RVWS">RVWD</span></span>
            </div>
            <div className="profile-content">
                {/*----------------------- Profile Info Section---------------------------- */}
                <section className={`profile-info ${isEditing ? 'is-editing-mode' : ''}`}>
                    <div className="profile-info-pic">
                        <img src="placeholder.png" alt="ProfilePicture" />
                        {isEditing && <div className="profile-pic-overlay edit-anim"><img src="camera-solid-full.svg" alt="Edit" /></div>}
                    </div>
                    
                    <div className="profile-info-details">
                        <div className="profile-info-upper">
                            <div className="profile-info-name">
                                {isEditing ? (
                                    <div className="edit-anim edit-inputs-group">
                                        <Input type="text" value={profileData.name} onChange={handleChange} />
                                        <Input type="text" value={profileData.username} onChange={handleChange} />
                                    </div>
                                ) : (
                                    <div className="view-anim">
                                        <p className="profile-info-name-text">{profileData.name}</p>
                                        <p className="profile-info-username">{profileData.username}</p>
                                    </div>
                                )}
                            </div>

                            {ownProfile && (
                                <div className="profile-info-buttons">
                                    {isEditing ? (
                                        <div className="edit-anim edit-actions">
                                            <button className="profile-btn save-btn" onClick={handleSave}><img src="floppy-disk-regular-full.svg" alt="Save" /></button>
                                            <button className="profile-btn cancel-btn" onClick={handleCancel}>✕</button>
                                        </div>
                                    ) : (
                                        <div className="view-anim edit-actions">
                                            <button className="profile-btn" onClick={handleEditToggle}><img src="pencil-solid-full.svg" alt="Edit" /></button>
                                            <button className="profile-btn" onClick={() => (window.location.href = "/settings")}><img src="gear-solid-full.svg" alt="Settings" /></button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="profile-info-stats desktop-stats">
                                <div className="profile-info-stat"><p className="profile-info-stat-number">100</p><p className="profile-info-stat-label">Reseñas</p></div>
                                <div className="profile-info-stat"><p className="profile-info-stat-number">50</p><p className="profile-info-stat-label">Seguidores</p></div>
                                <div className="profile-info-stat"><p className="profile-info-stat-number">75</p><p className="profile-info-stat-label">Seguidos</p></div>
                            </div>
                        </div>
                        
                        <div className="profile-info-bio">
                            {isEditing ? (
                                <TextArea value={profileData.bio} onChange={handleChange} rows={5} className="edit-anim" />
                            ) : (
                                <p className="profile-info-bio-text view-anim">{profileData.bio}</p>
                            )}
                        </div>
                        <div className="profile-info-stats mobile-stats">
                            <div className="profile-info-stat"><p className="profile-info-stat-number">567</p><p className="profile-info-stat-label">Seguidores</p></div>
                            <div className="profile-info-stat"><p className="profile-info-stat-number">569</p><p className="profile-info-stat-label">Seguidos</p></div>
                            <div className="profile-info-stat"><p className="profile-info-stat-number">124</p><p className="profile-info-stat-label"><span className="RVWS">RVWS</span></p></div>
                        </div>
                    </div>
                </section>
                {/*----------------------- Top Songs Section---------------------------- */}
                <section className="profile-top-songs">
                    <span className="profile-subtitle">Tus top 4 canciones</span>
                    <div className="carousel-wrapper">
                        <div className="top-songs-grid" ref={carouselRef} onScroll={handleScroll}>
                            {profileData.topSongs.map((song, index) => (
                                <div key={`song-slot-${index}`} className="song-slot-container">
                                    {song !== null && activeSearchSlot !== index && (
                                        <div className={`filled-slot group ${removingSlot === index ? 'removing' : ''} ${isEditing ? 'jiggle-anim' : ''}`}>
                                            <MediaCard title={song.title} type="cancion" artist={song.artist} imageUrl={song.imageUrl} forceShowInfo={true} />
                                            {isEditing && (
                                                <div className="remove-overlay" onClick={() => handleRemoveSong(index)}>
                                                    <div className="remove-btn-circle"><span className="close-icon">&times;</span></div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {activeSearchSlot === index && isEditing && (
                                        <div className={`search-slot-active ${closingSlot === index ? 'closing' : ''}`}>
                                            <SearchBar placeholder="Busca tu canción favorita..." value={songSearchQuery} onChange={(e) => setSongSearchQuery(e.target.value)} />
                                            {songSearchQuery.trim() !== '' && (
                                                <div className="search-dropdown-results slot-search-dropdown">
                                                    {searchResultsSongs.length > 0 ? (
                                                        searchResultsSongs.map((resultSong, i) => (
                                                            <div key={`search-song-${i}`} className="search-result-item" onClick={() => handleSelectSong(resultSong, index)}>
                                                                <img src={resultSong.imageUrl} alt={resultSong.title} />
                                                                <div><p className="result-title">{resultSong.title}</p><p className="result-sub">{resultSong.artist}</p></div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="search-result-item" style={{ pointerEvents: 'none' }}><p className="result-sub">No se encontró "{songSearchQuery}"</p></div>
                                                    )}
                                                </div>
                                            )}
                                            <button className="cancel-search-btn" onClick={() => handleCancelSearch(index)}>Cancelar</button>
                                        </div>
                                    )}

                                    {song === null && activeSearchSlot !== index && (
                                        <div className={`empty-slot ${isEditing ? 'editable' : ''}`} onClick={() => { if (isEditing) { setActiveSearchSlot(index); setSongSearchQuery(''); } }}>
                                            {isEditing ? <div className="add-circle-btn"><div className="plus-icon">+</div></div> : <div className="empty-text-placeholder">Falta canción</div>}
                                        </div>
                                    )}

                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="carousel-pagination">
                        {paginationLetters.map((letter, index) => (
                            <span 
                                key={index} 
                                onClick={() => scrollToCard(index)}
                                className={`pagination-letter ${activeIndex === index ? 'active' : ''}`}
                            >
                                {letter}
                            </span>
                        ))}
                    </div>
                </section>
                <section className="profile-reviews">
                    <div className="reviews-header-mobile">
                        <span className="profile-subtitle">Tus <span className="RVWS">RVWS</span></span>
                    </div>
                    <div className="profile-reviews-list">
                        <ReviewBigCard
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
                            profile={true}
                        />
                        <ReviewBigCard
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
                            profile={true}
                        />
                    </div>
                    <Button variant="text" className="profile-load-more-btn">Ver todas</Button>
                </section>
            </div>
        </div>
    );
}