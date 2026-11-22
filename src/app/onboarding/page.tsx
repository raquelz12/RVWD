'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/top-songs.css';
import './onboarding.css';
import SearchBar from '../../../components/SearchBar/SearchBar';
import ArtistCard from '../../../components/ArtistCard/ArtistCard';
import Button from '../../../components/Button/Button';
import MediaCard from '../../../components/MediaCard/MediaCard';
import Dot from '../../../components/Dot/Dot';
import SmallCard from '../../../components/SmallCard/SmallCard';
import Score from '../../../components/Score/Score';
import Input from '../../../components/Input/Input';
import TextArea from '../../../components/TextArea/TextArea';

interface SongData {
  title: string;
  artist: string;
  imageUrl: string;
}

const ARTISTS_LIST = ['Artista 1', 'Artista 2', 'Artista 3', 'Artista 4', 'Artista 5', 'Artista 6', 'Artista 7', 'Rosalía', 'C. Tangana'];
const SONGS_LIST: SongData[] = [
  { title: 'No pasa nada hombre', artist: 'Clarent', imageUrl: '/placeholderCards.png' },
  { title: 'Motomami', artist: 'Rosalía', imageUrl: '/placeholderCards.png' },
  { title: 'El Madrileño', artist: 'C. Tangana', imageUrl: '/placeholderCards.png' },
  { title: 'Ojitos Lindos', artist: 'Bad Bunny', imageUrl: '/placeholderCards.png' },
  { title: 'Blinding Lights', artist: 'The Weeknd', imageUrl: '/placeholderCards.png' },
];

const TOTAL_STEPS = 3;
/* Lo que duran las animaciones de quitar canción y cerrar buscador (top-songs.css) */
const SLOT_ANIMATION_MS = 400;

// Una canción se identifica por título y artista (no por el objeto en memoria)
const songKey = (song: SongData) => `${song.title}|${song.artist}`;

const matches = (text: string, query: string) => text.toLowerCase().includes(query.trim().toLowerCase());

interface SearchResultItem {
  key: string;
  title: string;
  sub: string;
  imageUrl: string;
  disabled?: boolean;
  onSelect: () => void;
}

/* Desplegable de resultados de los tres buscadores de la página */
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

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  /* Estados del paso 1 */
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  /* Estados del paso 2 */
  const [selectedSongs, setSelectedSongs] = useState<(SongData | null)[]>([null, null, null, null]);
  const [activeSearchSlot, setActiveSearchSlot] = useState<number>(-1);
  const [songSearchQuery, setSongSearchQuery] = useState('');
  const [closingSlot, setClosingSlot] = useState<number>(-1);
  const [removingSlots, setRemovingSlots] = useState<number[]>([]);
  const closeSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Estados del paso 3 */
  const [reviewSubStep, setReviewSubStep] = useState<1 | 2>(1);
  const [reviewSong, setReviewSong] = useState<SongData | null>(null);
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewScore, setReviewScore] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');

  // Al cambiar de paso (o de subpaso): arriba del todo y foco en el título, para que se anuncie
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    mainRef.current?.querySelector<HTMLHeadingElement>('h1')?.focus({ preventScroll: true });
  }, [currentStep, reviewSubStep]);

  // Un clic fuera del buscador cierra su desplegable. En cada paso solo hay un buscador
  // a la vez, así que basta con mirar si el clic cae dentro de alguno ([data-search-box])
  const hasOpenSearch = [searchQuery, songSearchQuery, reviewSearchQuery].some((q) => q.trim() !== '');
  useEffect(() => {
    if (!hasOpenSearch) return;

    const handlePointerDown = (event: PointerEvent) => {
      if ((event.target as Element).closest?.('[data-search-box]')) return;
      setSearchQuery('');
      setSongSearchQuery('');
      setReviewSearchQuery('');
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [hasOpenSearch]);

  // Si se sale de la página con el buscador cerrándose, no se queda el timeout pendiente
  useEffect(() => {
    const timeout = closeSearchTimeout;
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // En el paso 3, si ya se está escribiendo la reseña, "Atrás" vuelve a elegir canción
  const goBack = () => {
    if (currentStep === 3 && reviewSubStep === 2) {
      setReviewSubStep(1);
      return;
    }
    prevStep();
  };

  const goToFeed = () => router.push('/feed');

  /* Del paso 1 */
  const toggleArtist = (artistName: string) => {
    setSelectedArtists((prev) =>
      prev.includes(artistName)
        ? prev.filter((name) => name !== artistName)
        : [...prev, artistName]
    );
  };

  const searchResults = searchQuery.trim() !== ''
    ? ARTISTS_LIST.filter((a) => matches(a, searchQuery)).slice(0, 5)
    : [];

  const defaultArtists = ARTISTS_LIST.slice(0, 6);

  /* Del paso 2 */
  const validSelectedSongs = selectedSongs.filter((s): s is SongData => s !== null);

  const isInTopSongs = (song: SongData) =>
    validSelectedSongs.some((s) => songKey(s) === songKey(song));

  const searchResultsSongs = songSearchQuery.trim() !== ''
    ? SONGS_LIST.filter((s) => matches(s.title, songSearchQuery)).slice(0, 5)
    : [];

  const clearCloseSearchTimeout = () => {
    if (closeSearchTimeout.current) {
      clearTimeout(closeSearchTimeout.current);
      closeSearchTimeout.current = null;
    }
  };

  const openSlotSearch = (slotIndex: number) => {
    clearCloseSearchTimeout();
    setClosingSlot(-1);
    setActiveSearchSlot(slotIndex);
    setSongSearchQuery('');
  };

  const handleSelectSong = (song: SongData, slotIndex: number) => {
    // Las repetidas salen desactivadas en los resultados; esto es solo por seguridad
    if (isInTopSongs(song)) return;

    setSelectedSongs((prev) => prev.map((s, i) => (i === slotIndex ? song : s)));
    clearCloseSearchTimeout();
    setActiveSearchSlot(-1);
    setClosingSlot(-1);
    setSongSearchQuery('');
  };

  const handleRemoveSong = (slotIndex: number) => {
    if (removingSlots.includes(slotIndex)) return;
    setRemovingSlots((prev) => [...prev, slotIndex]);

    setTimeout(() => {
      setSelectedSongs((prev) => prev.map((s, i) => (i === slotIndex ? null : s)));
      setRemovingSlots((prev) => prev.filter((i) => i !== slotIndex));
    }, SLOT_ANIMATION_MS);
  };

  const handleCancelSearch = (slotIndex: number) => {
    if (closingSlot === slotIndex) return;
    setClosingSlot(slotIndex);

    clearCloseSearchTimeout();
    closeSearchTimeout.current = setTimeout(() => {
      closeSearchTimeout.current = null;
      setActiveSearchSlot(-1);
      setClosingSlot(-1);
      setSongSearchQuery('');
    }, SLOT_ANIMATION_MS);
  };

  /* Del paso 3 */
  const baseReviewSuggestions = validSelectedSongs.length > 0
    ? validSelectedSongs
    : SONGS_LIST.slice(0, 4);

  // Si la canción elegida vino del buscador, se enseña la primera para que se vea marcada
  const suggestedReviewSongs = reviewSong && !baseReviewSuggestions.some((s) => songKey(s) === songKey(reviewSong))
    ? [reviewSong, ...baseReviewSuggestions]
    : baseReviewSuggestions;

  const searchResultsReview = reviewSearchQuery.trim() !== ''
    ? SONGS_LIST.filter((s) => matches(s.title, reviewSearchQuery)).slice(0, 5)
    : [];

  const handleSelectReviewSong = (song: SongData) => {
    setReviewSong(song);
    setReviewSearchQuery('');
    setReviewSubStep(2);
  };

  const canPublish = reviewScore !== '' && reviewTitle.trim() !== '' && reviewText.trim() !== '';

  const renderStepHeader = (step: number, title: React.ReactNode, description: string) => (
    <div className="step-header">
      <div className="step-indicator">
        <div className="step-dots" aria-hidden="true">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <Dot key={i} type={i < step ? 'filled' : 'empty'} />
          ))}
        </div>
        <span className="step-text" aria-hidden="true">{step}/{TOTAL_STEPS}</span>
        <span className="sr-only">Paso {step} de {TOTAL_STEPS}</span>
      </div>
      <h1 className="page-title" tabIndex={-1}>{title}</h1>
      <p className="step-description">{description}</p>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step">
            {renderStepHeader(
              1,
              '¿Cuáles son tus imprescindibles?',
              'Selecciona al menos 3 artistas para enterarte de sus novedades y ver qué opina la gente.'
            )}
            <div
              data-search-box
              className="search-dropdown-wrapper"
              onKeyDown={(e) => { if (e.key === 'Escape') setSearchQuery(''); }}
            >
              <SearchBar
                placeholder="¿Falta tu favorito? Búscalo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery.trim() !== '' && (
                <SearchResults
                  notFound={`No se encontró el artista "${searchQuery}"`}
                  items={searchResults.map((artist) => {
                    const alreadySelected = selectedArtists.includes(artist);
                    return {
                      key: artist,
                      title: artist,
                      sub: alreadySelected ? 'Ya seleccionado' : 'Artista',
                      imageUrl: '/placeholderCards.png',
                      disabled: alreadySelected,
                      onSelect: () => {
                        toggleArtist(artist);
                        setSearchQuery('');
                      },
                    };
                  })}
                />
              )}
            </div>
            {selectedArtists.length > 0 && (
              <ul className="selected-chips-container" aria-label="Artistas seleccionados">
                {selectedArtists.map((artist) => (
                  <li key={artist}>
                    <button
                      type="button"
                      className="artist-chip"
                      onClick={() => toggleArtist(artist)}
                      aria-label={`Quitar ${artist}`}
                    >
                      <img src="/placeholderCards.png" alt="" />
                      {artist}
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <fieldset className="artist-suggestions">
              <legend className="sr-only">Artistas sugeridos</legend>
              {defaultArtists.map((artist) => (
                <label key={artist} className="artist-option">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedArtists.includes(artist)}
                    onChange={() => toggleArtist(artist)}
                  />
                  <ArtistCard
                    hasScore={false}
                    name={artist}
                    isSelected={selectedArtists.includes(artist)}
                  />
                </label>
              ))}
            </fieldset>
            <div className="button-group">
              <Button onClick={nextStep} variant="text">Omitir</Button>
              <Button onClick={nextStep} disabled={selectedArtists.length < 3}>
                {selectedArtists.length < 3 ? `Siguiente (${selectedArtists.length}/3)` : 'Siguiente'}
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step">
            {renderStepHeader(
              2,
              'Tus 4 indiscutibles',
              'Busca y elige las 4 canciones que te definen. Aparecerán destacadas en tu perfil y las podrás cambiar desde ahí.'
            )}
            <div className="top-songs-grid">
              {selectedSongs.map((song, index) => (
                <div key={`song-slot-${index}`} className="song-slot-container">
                  {song !== null && activeSearchSlot !== index && (
                    <div key={`filled-${songKey(song)}`} className={`filled-slot ${removingSlots.includes(index) ? 'removing' : ''}`}>
                      <MediaCard
                        title={song.title}
                        type="cancion"
                        artist={song.artist}
                        imageUrl={song.imageUrl}
                        forceShowInfo={true}
                      />
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
                    </div>
                  )}
                  {activeSearchSlot === index && (
                    <div
                      data-search-box
                      className={`search-slot-active ${closingSlot === index ? 'closing' : ''}`}
                      onKeyDown={(e) => { if (e.key === 'Escape') handleCancelSearch(index); }}
                    >
                      <SearchBar
                        placeholder="Busca tu canción favorita..."
                        value={songSearchQuery}
                        onChange={(e) => setSongSearchQuery(e.target.value)}
                        autoFocus
                      />
                      {songSearchQuery.trim() !== '' && (
                        <SearchResults
                          className="slot-search-dropdown"
                          notFound={`No se encontró "${songSearchQuery}"`}
                          items={searchResultsSongs.map((resultSong) => {
                            const alreadyInTop = isInTopSongs(resultSong);
                            return {
                              key: songKey(resultSong),
                              title: resultSong.title,
                              sub: alreadyInTop ? 'Ya está en tu top 4' : resultSong.artist,
                              imageUrl: resultSong.imageUrl,
                              disabled: alreadyInTop,
                              onSelect: () => handleSelectSong(resultSong, index),
                            };
                          })}
                        />
                      )}
                      <button
                        type="button"
                        className="cancel-search-btn"
                        onClick={() => handleCancelSearch(index)}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                  {song === null && activeSearchSlot !== index && (
                    <button
                      type="button"
                      className="empty-slot editable"
                      onClick={() => openSlotSearch(index)}
                      aria-label={`Añadir canción ${index + 1} de 4`}
                    >
                      <span className="add-circle-btn" aria-hidden="true">
                        <span className="plus-icon">+</span>
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="button-group">
              <Button onClick={goBack} variant="text">‹ Atrás</Button>
              <div className="button-group-end">
                <Button onClick={nextStep} variant="text">Omitir</Button>
                <Button onClick={nextStep} disabled={validSelectedSongs.length === 0}>
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step step-3">
            {renderStepHeader(
              3,
              <>Deja tu primera <span className="RVWS">RVW</span></>,
              'Puntúa y cuéntale a la gente qué piensas de esta canción que tienes en bucle.'
            )}
            {reviewSubStep === 1 ? (
              <>
                <div className="review-selection-header">
                  <p className="review-question">¿Quieres empezar reseñando uno de tus favoritos?</p>
                  <div
                    data-search-box
                    className="review-search-wrapper"
                    onKeyDown={(e) => { if (e.key === 'Escape') setReviewSearchQuery(''); }}
                  >
                    <SearchBar
                      placeholder="O busca una diferente..."
                      value={reviewSearchQuery}
                      onChange={(e) => setReviewSearchQuery(e.target.value)}
                    />
                    {reviewSearchQuery.trim() !== '' && (
                      <SearchResults
                        notFound={`No se encontró "${reviewSearchQuery}"`}
                        items={searchResultsReview.map((song) => ({
                          key: songKey(song),
                          title: song.title,
                          sub: song.artist,
                          imageUrl: song.imageUrl,
                          onSelect: () => handleSelectReviewSong(song),
                        }))}
                      />
                    )}
                  </div>
                </div>
                <fieldset className="review-suggestions-row">
                  <legend className="sr-only">Elige la canción que vas a reseñar</legend>
                  {suggestedReviewSongs.map((song) => {
                    const isSelected = reviewSong !== null && songKey(reviewSong) === songKey(song);
                    return (
                      <label key={songKey(song)} className="review-option">
                        <input
                          type="radio"
                          name="onboarding-review-song"
                          className="sr-only"
                          checked={isSelected}
                          onChange={() => setReviewSong(song)}
                        />
                        <SmallCard
                          type="cancion"
                          title={song.title}
                          artist={song.artist}
                          imageUrl={song.imageUrl}
                          selected={isSelected}
                        />
                      </label>
                    );
                  })}
                </fieldset>
              </>
            ) : (
              <div className="review-form-card fade-in-section">
                <div className="review-form-image">
                  <img src={reviewSong?.imageUrl} alt="" />
                </div>
                <div className="review-form-content">
                  <div className="review-form-top">
                    <div className="review-song-info">
                      <span className="review-type-badge">Canción</span>
                      <h2 className="block-title">{reviewSong?.title}</h2>
                      <p>{reviewSong?.artist}</p>
                    </div>
                    <div className="review-score-input">
                      <label htmlFor="onboarding-review-score">Deja tu puntuación</label>
                      <Score
                        id="onboarding-review-score"
                        input={true}
                        score={reviewScore}
                        onChange={(newScore) => setReviewScore(newScore)}
                        variant="red"
                      />
                    </div>
                  </div>
                  <div className="review-input-group">
                    <label htmlFor="onboarding-review-title">Ponle un título a tu RVW</label>
                    <Input
                      id="onboarding-review-title"
                      type="text"
                      placeholder="Escribe un título breve..."
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                    />
                  </div>
                  <div className="review-input-group">
                    <label htmlFor="onboarding-review-text">Escribe tu RVW</label>
                    <TextArea
                      id="onboarding-review-text"
                      placeholder="Escribe lo que piensas..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="button-group">
              <Button variant="text" onClick={goBack}>‹ Atrás</Button>
              <div className="button-group-end">
                <Button variant="text" onClick={goToFeed}>
                  Omitir
                </Button>
                {reviewSubStep === 1 ? (
                  <Button onClick={() => setReviewSubStep(2)} disabled={!reviewSong}>
                    Siguiente
                  </Button>
                ) : (
                  <Button onClick={goToFeed} disabled={!canPublish}>
                    Publicar e ir al feed
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <main ref={mainRef} className="onboarding-container">
      {/* Con key, la animación de entrada se repite en cada paso */}
      <div key={currentStep} className="fade-in-section">
        {renderStepContent()}
      </div>
    </main>
  );
}
