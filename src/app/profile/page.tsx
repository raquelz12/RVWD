'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import '@/styles/top-songs.css';
import './profile.css';
import MediaCard from '../../../components/MediaCard/MediaCard';
import ReviewBigCard from '../../../components/ReviewBigCard/ReviewBigCard';
import SearchBar from '../../../components/SearchBar/SearchBar';
import Input from '../../../components/Input/Input';
import TextArea from '../../../components/TextArea/TextArea';
import Carousel from '../../../components/Carousel/Carousel';
import ProfileStats from '../../../components/ProfileStats/ProfileStats';
import Rvw from '../../../components/Rvw/Rvw';

interface SongData {
    id: string;
    title: string;
    artist: string;
    imageUrl: string;
}

interface ProfileData {
    name: string;
    username: string;
    bio: string;
    avatarUrl: string;
    topSongs: (SongData | null)[];
}

// TODO: todo esto vendrá del backend
const SONGS_LIST: SongData[] = [
    { id: '1', title: 'Jukiar 1', artist: 'Clarent', imageUrl: '/placeholderCards.png' },
    { id: '2', title: 'Jukiar 2', artist: 'Clarent', imageUrl: '/placeholderCards.png' },
    { id: '3', title: 'Jukiar 3', artist: 'Clarent', imageUrl: '/placeholderCards.png' },
    { id: '4', title: 'Jukiar 4', artist: 'Clarent', imageUrl: '/placeholderCards.png' },
    { id: '5', title: 'Motomami', artist: 'Rosalía', imageUrl: '/placeholderCards.png' },
    { id: '6', title: 'El Madrileño', artist: 'C. Tangana', imageUrl: '/placeholderCards.png' },
];

const INITIAL_PROFILE: ProfileData = {
    name: 'Raquel Arnaiz Mínguez',
    username: '@raquelz.12204',
    bio: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.',
    avatarUrl: '/placeholder.png',
    topSongs: [SONGS_LIST[0], SONGS_LIST[1], null, SONGS_LIST[3]],
};

const STATS = { followers: 569, following: 124, rvws: 38 };

const MY_REVIEWS = [
    { id: '123', mediaHref: '/album/123' },
    { id: '124', mediaHref: '/album/123' },
];

const MAX_NAME_LENGTH = 50;
const MAX_BIO_LENGTH = 300;
/* Lo que duran las animaciones de quitar canción y cerrar buscador (top-songs.css) */
const SLOT_ANIMATION_MS = 400;

const matches = (text: string, query: string) => text.toLowerCase().includes(query.trim().toLowerCase());

// Las fotos elegidas en el navegador son URLs blob: temporales que hay que liberar
const revokeIfBlob = (url: string) => {
    if (url.startsWith('blob:')) URL.revokeObjectURL(url);
};

interface SearchResultItem {
    key: string;
    title: string;
    sub: string;
    imageUrl: string;
    disabled?: boolean;
    onSelect: () => void;
}

/* Desplegable de resultados del buscador de un hueco (copia del de onboarding) */
function SearchResults({ items, notFound, className = '' }: { items: SearchResultItem[]; notFound: string; className?: string }) {
    return (
        <div className={`search-dropdown-results ${className}`}>
            {items.length > 0 ? (
                <ul className="search-results-list">
                    {items.map((item) => (
                        <li key={item.key}>
                            <button
                                type="button"
                                className="search-result-item"
                                disabled={item.disabled}
                                onClick={item.onSelect}
                            >
                                <img src={item.imageUrl} alt="" />
                                <span className="search-result-text">
                                    <span className="result-title">{item.title}</span>
                                    <span className="result-sub">{item.sub}</span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="search-no-results">{notFound}</p>
            )}
        </div>
    );
}

export default function ProfilePage() {
    // TODO: saldrá de comparar el perfil visitado con la sesión cuando haya backend
    const ownProfile = true;

    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState<ProfileData>(INITIAL_PROFILE);
    // Lo que había al entrar en edición, para recuperarlo al cancelar
    const [backupData, setBackupData] = useState<ProfileData>(INITIAL_PROFILE);

    const [activeSearchSlot, setActiveSearchSlot] = useState<number | null>(null);
    const [songSearchQuery, setSongSearchQuery] = useState('');
    const [closingSlot, setClosingSlot] = useState<number | null>(null);
    const [removingSlots, setRemovingSlots] = useState<number[]>([]);

    const closeSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const removeTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
    const avatarUrlRef = useRef(profileData.avatarUrl);

    useEffect(() => {
        avatarUrlRef.current = profileData.avatarUrl;
    }, [profileData.avatarUrl]);

    const clearCloseSearchTimeout = () => {
        if (closeSearchTimeout.current) {
            clearTimeout(closeSearchTimeout.current);
            closeSearchTimeout.current = null;
        }
    };

    const clearRemoveTimeouts = () => {
        removeTimeouts.current.forEach(clearTimeout);
        removeTimeouts.current = [];
    };

    // Al salir de la página: sin temporizadores pendientes ni foto temporal en memoria
    useEffect(() => {
        const closeTimeout = closeSearchTimeout;
        const removes = removeTimeouts;
        const avatar = avatarUrlRef;
        return () => {
            if (closeTimeout.current) clearTimeout(closeTimeout.current);
            removes.current.forEach(clearTimeout);
            revokeIfBlob(avatar.current);
        };
    }, []);

    const resetSlots = () => {
        clearCloseSearchTimeout();
        clearRemoveTimeouts();
        setActiveSearchSlot(null);
        setClosingSlot(null);
        setRemovingSlots([]);
        setSongSearchQuery('');
    };

    const startEditing = () => {
        setBackupData(profileData);
        setIsEditing(true);
    };

    const handleCancel = useCallback(() => {
        if (closeSearchTimeout.current) clearTimeout(closeSearchTimeout.current);
        closeSearchTimeout.current = null;
        removeTimeouts.current.forEach(clearTimeout);
        removeTimeouts.current = [];
        setActiveSearchSlot(null);
        setClosingSlot(null);
        setRemovingSlots([]);
        setSongSearchQuery('');
        // Si se eligió otra foto, se libera y vuelve la de antes
        if (profileData.avatarUrl !== backupData.avatarUrl) revokeIfBlob(profileData.avatarUrl);
        setProfileData(backupData);
        setIsEditing(false);
    }, [profileData.avatarUrl, backupData]);

    const canSave = profileData.name.trim() !== '';

    const handleSave = () => {
        if (!canSave) return;
        // Las canciones que se estaban quitando se quitan ya, sin esperar a la animación
        const pendingRemovals = removingSlots;
        resetSlots();
        if (backupData.avatarUrl !== profileData.avatarUrl) revokeIfBlob(backupData.avatarUrl);
        setProfileData((prev) => ({
            ...prev,
            name: prev.name.trim(),
            topSongs: prev.topSongs.map((s, i) => (pendingRemovals.includes(i) ? null : s)),
        }));
        setIsEditing(false);
        // TODO: enviar al backend (incluida la foto nueva, si la hay)
    };

    // Escape cancela la edición (si hay un buscador abierto, Escape solo cierra el buscador)
    useEffect(() => {
        if (!isEditing) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape' || activeSearchSlot !== null) return;
            // Con un menú ⋮ abierto, Escape solo cierra el menú (lo hace MoreMenu)
            if (document.querySelector('.more-menu.is-open')) return;
            handleCancel();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isEditing, activeSearchSlot, handleCancel]);

    // Un clic fuera del buscador cierra su desplegable
    const hasOpenSearch = songSearchQuery.trim() !== '';
    useEffect(() => {
        if (!hasOpenSearch) return;
        const handlePointerDown = (event: PointerEvent) => {
            if ((event.target as Element).closest?.('[data-search-box]')) return;
            setSongSearchQuery('');
        };
        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [hasOpenSearch]);

    const handleTextChange = (field: 'name' | 'bio') =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { value } = e.target;
            setProfileData((prev) => ({ ...prev, [field]: value }));
        };

    // La foto elegida se ve al momento; subirla queda para el backend
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        // Se vacía para que volver a elegir la misma foto también avise
        e.target.value = '';
        if (!file) return;
        if (profileData.avatarUrl !== backupData.avatarUrl) revokeIfBlob(profileData.avatarUrl);
        const url = URL.createObjectURL(file);
        setProfileData((prev) => ({ ...prev, avatarUrl: url }));
    };

    /* Top 4 */
    const validTopSongs = profileData.topSongs.filter((s): s is SongData => s !== null);
    const isInTopSongs = (song: SongData) => validTopSongs.some((s) => s.id === song.id);

    const searchResultsSongs = hasOpenSearch
        ? SONGS_LIST.filter((s) => matches(s.title, songSearchQuery)).slice(0, 5)
        : [];

    const openSlotSearch = (slotIndex: number) => {
        // Fuera del modo edición, pulsar un hueco vacío entra en edición y abre su buscador
        if (!isEditing) startEditing();
        clearCloseSearchTimeout();
        setClosingSlot(null);
        setActiveSearchSlot(slotIndex);
        setSongSearchQuery('');
    };

    const handleSelectSong = (song: SongData, slotIndex: number) => {
        // Las repetidas salen desactivadas en los resultados; esto es solo por seguridad
        if (isInTopSongs(song)) return;
        setProfileData((prev) => ({
            ...prev,
            topSongs: prev.topSongs.map((s, i) => (i === slotIndex ? song : s)),
        }));
        clearCloseSearchTimeout();
        setActiveSearchSlot(null);
        setClosingSlot(null);
        setSongSearchQuery('');
    };

    const handleRemoveSong = (slotIndex: number) => {
        if (removingSlots.includes(slotIndex)) return;
        setRemovingSlots((prev) => [...prev, slotIndex]);

        const timeout = setTimeout(() => {
            removeTimeouts.current = removeTimeouts.current.filter((t) => t !== timeout);
            setProfileData((prev) => ({
                ...prev,
                topSongs: prev.topSongs.map((s, i) => (i === slotIndex ? null : s)),
            }));
            setRemovingSlots((prev) => prev.filter((i) => i !== slotIndex));
        }, SLOT_ANIMATION_MS);
        removeTimeouts.current.push(timeout);
    };

    const handleCancelSearch = (slotIndex: number) => {
        if (closingSlot === slotIndex) return;
        setClosingSlot(slotIndex);

        clearCloseSearchTimeout();
        closeSearchTimeout.current = setTimeout(() => {
            closeSearchTimeout.current = null;
            setActiveSearchSlot(null);
            setClosingSlot(null);
            setSongSearchQuery('');
        }, SLOT_ANIMATION_MS);
    };

    const renderSongSlots = () =>
        profileData.topSongs.map((song, index) => (
            <div key={`song-slot-${index}`} className="song-slot-container">
                {song !== null && activeSearchSlot !== index && (
                    <div
                        key={`filled-${song.id}`}
                        className={`filled-slot ${removingSlots.includes(index) ? 'removing' : ''} ${isEditing ? 'profile-jiggle' : ''}`}
                    >
                        <MediaCard
                            title={song.title}
                            type="cancion"
                            artist={song.artist}
                            imageUrl={song.imageUrl}
                            forceShowInfo={true}
                            href={isEditing ? undefined : `/song/${song.id}`}
                        />
                        {isEditing && (
                            <button
                                type="button"
                                className="remove-overlay"
                                onClick={() => handleRemoveSong(index)}
                                aria-label={`Quitar ${song.title} del top 4`}
                            >
                                <span className="remove-btn-circle" aria-hidden="true">
                                    <span className="close-icon">&times;</span>
                                </span>
                            </button>
                        )}
                    </div>
                )}
                {activeSearchSlot === index && isEditing && (
                    <div
                        data-search-box
                        className={`search-slot-active ${closingSlot === index ? 'closing' : ''}`}
                        onKeyDown={(e) => {
                            if (e.key !== 'Escape') return;
                            // Que no llegue al Escape de la página, que cancelaría toda la edición
                            e.stopPropagation();
                            handleCancelSearch(index);
                        }}
                    >
                        <SearchBar
                            placeholder="Busca tu canción favorita..."
                            value={songSearchQuery}
                            onChange={(e) => setSongSearchQuery(e.target.value)}
                            autoFocus
                        />
                        {hasOpenSearch && (
                            <SearchResults
                                className="slot-search-dropdown"
                                notFound={`No se encontró "${songSearchQuery}"`}
                                items={searchResultsSongs.map((resultSong) => {
                                    const alreadyInTop = isInTopSongs(resultSong);
                                    return {
                                        key: resultSong.id,
                                        title: resultSong.title,
                                        sub: alreadyInTop ? 'Ya está en tu top 4' : resultSong.artist,
                                        imageUrl: resultSong.imageUrl,
                                        disabled: alreadyInTop,
                                        onSelect: () => handleSelectSong(resultSong, index),
                                    };
                                })}
                            />
                        )}
                        <button type="button" className="cancel-search-btn" onClick={() => handleCancelSearch(index)}>
                            Cancelar
                        </button>
                    </div>
                )}
                {song === null && activeSearchSlot !== index && (
                    ownProfile ? (
                        <button
                            type="button"
                            className="empty-slot editable"
                            onClick={() => openSlotSearch(index)}
                            aria-label={`Añadir canción ${index + 1} de 4`}
                        >
                            {isEditing ? (
                                <span className="add-circle-btn" aria-hidden="true">
                                    <span className="plus-icon">+</span>
                                </span>
                            ) : (
                                <span className="empty-text-placeholder" aria-hidden="true">Añadir canción</span>
                            )}
                        </button>
                    ) : (
                        <div className="empty-slot">
                            <span className="empty-text-placeholder">Sin canción</span>
                        </div>
                    )
                )}
            </div>
        ));

    return (
        <div className="profile-container">
            <h1 className="page-title profile-title">Tu perfil de <Rvw>RVWD</Rvw></h1>
            <div className="profile-content">
                {/*----------------------- Datos del perfil ---------------------------- */}
                <section className={`profile-info ${isEditing ? 'is-editing-mode' : ''}`} aria-label="Datos del perfil">
                    <div className="profile-info-pic">
                        <img src={profileData.avatarUrl} alt={`Foto de perfil de ${profileData.name}`} />
                        {isEditing && (
                            <label className="profile-pic-overlay profile-edit-anim">
                                <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
                                <img src="/camera-solid-full.svg" alt="" />
                                <span className="sr-only">Cambiar foto de perfil</span>
                            </label>
                        )}
                    </div>
                    <div className="profile-info-details">
                        <div className="profile-info-name">
                            {isEditing ? (
                                <div className="profile-edit-anim profile-edit-inputs">
                                    <Input
                                        type="text"
                                        aria-label="Nombre"
                                        value={profileData.name}
                                        onChange={handleTextChange('name')}
                                        maxLength={MAX_NAME_LENGTH}
                                        required
                                    />
                                    {/* El nombre de usuario se cambia desde Ajustes > Cuenta */}
                                    <p className="profile-info-username">{profileData.username}</p>
                                </div>
                            ) : (
                                <div className="profile-view-anim">
                                    <p className="profile-info-name-text">{profileData.name}</p>
                                    <p className="profile-info-username">{profileData.username}</p>
                                </div>
                            )}
                        </div>
                        {ownProfile && (
                            <div className="profile-info-buttons">
                                {isEditing ? (
                                    <div className="profile-edit-anim profile-edit-actions">
                                        <button type="button" className="profile-btn" onClick={handleSave} disabled={!canSave} aria-label="Guardar cambios">
                                            <img src="/floppy-disk-regular-full.svg" alt="" />
                                        </button>
                                        <button type="button" className="profile-btn is-secondary" onClick={handleCancel} aria-label="Cancelar">
                                            <span aria-hidden="true">✕</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="profile-view-anim profile-edit-actions">
                                        <button type="button" className="profile-btn" onClick={startEditing} aria-label="Editar perfil">
                                            <img src="/pencil-solid-full.svg" alt="" />
                                        </button>
                                        <Link href="/settings" className="profile-btn" aria-label="Ajustes">
                                            <img src="/gear-solid-full.svg" alt="" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Una sola vez: el CSS la pone junto al nombre en escritorio y bajo la bio en móvil */}
                        <ProfileStats className="profile-info-stats" {...STATS} />
                        <div className="profile-info-bio">
                            {isEditing ? (
                                <>
                                    <label htmlFor="profile-bio" className="sr-only">Biografía</label>
                                    <TextArea
                                        id="profile-bio"
                                        value={profileData.bio}
                                        onChange={handleTextChange('bio')}
                                        rows={5}
                                        maxLength={MAX_BIO_LENGTH}
                                        className="profile-edit-anim"
                                    />
                                </>
                            ) : (
                                <p className="profile-info-bio-text profile-view-anim">{profileData.bio}</p>
                            )}
                        </div>
                    </div>
                </section>
                {/*----------------------- Top 4 ---------------------------- */}
                <section className="profile-top-songs" aria-labelledby="profile-top-songs-title">
                    <h2 className="section-title profile-subtitle" id="profile-top-songs-title">Tus top 4 canciones</h2>
                    <div className="top-songs-grid profile-top-songs-desktop">
                        {renderSongSlots()}
                    </div>
                    <div className="profile-top-songs-mobile">
                        <Carousel>
                            {renderSongSlots()}
                        </Carousel>
                    </div>
                </section>
                {/*----------------------- Reseñas ---------------------------- */}
                <section className="profile-reviews" aria-labelledby="profile-reviews-title">
                    <h2 className="section-title profile-subtitle" id="profile-reviews-title">Tus <Rvw>RVWS</Rvw></h2>
                    <ul className="profile-reviews-list">
                        {MY_REVIEWS.map((review) => (
                            <li key={review.id}>
                                <ReviewBigCard
                                    href={`/reviews/${review.id}`}
                                    mediaHref={review.mediaHref}
                                    reviewId={review.id}
                                    ownReview
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
                                    pageScore={7.8}
                                    profile={true}
                                />
                            </li>
                        ))}
                    </ul>
                    <Link href="/profile/reviews" className="profile-view-all">Ver todas</Link>
                </section>
            </div>
        </div>
    );
}
