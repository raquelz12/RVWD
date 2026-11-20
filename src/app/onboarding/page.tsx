'use client';

import { useState } from 'react';
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

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  /* Estados del paso 2 */
  const [selectedSongs, setSelectedSongs] = useState<(SongData | null)[]>([null, null, null, null]);
  const [activeSearchSlot, setActiveSearchSlot] = useState<number>(-1);
  const [songSearchQuery, setSongSearchQuery] = useState('');
  const [closingSlot, setClosingSlot] = useState<number>(-1);
  const [removingSlot, setRemovingSlot] = useState<number>(-1);

  /* Estados del paso 3 */
  const [reviewSubStep, setReviewSubStep] = useState<1 | 2>(1);
  const [reviewSong, setReviewSong] = useState<SongData | null>(null);
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewScore, setReviewScore] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');

  /* Del paso 3 */
  const validSelectedSongs = selectedSongs.filter((s): s is SongData => s !== null);
  const suggestedReviewSongs = validSelectedSongs.length > 0 
    ? validSelectedSongs 
    : SONGS_LIST.slice(0, 4);

  const searchResultsReview = reviewSearchQuery.trim() !== ''
    ? SONGS_LIST.filter(s => s.title.toLowerCase().includes(reviewSearchQuery.toLowerCase())).slice(0, 5)
    : [];

  const handleSelectReviewSong = (song: SongData) => {
    setReviewSong(song);
    setReviewSearchQuery('');
    setReviewSubStep(2); 
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  /* Del paso 1 */
  const toggleArtist = (artistName: string) => {
    setSelectedArtists((prev) =>
      prev.includes(artistName)
        ? prev.filter((name) => name !== artistName)
        : [...prev, artistName]
    );
  };

  const searchResults = searchQuery.trim() !== ''
    ? ARTISTS_LIST.filter(a => a.toLowerCase().includes(searchQuery.toLowerCase())).slice(0,5)
    : [];

  const defaultArtists = ARTISTS_LIST.slice(0, 6);

  /* Del paso 2 */
  const searchResultsSongs = songSearchQuery.trim() !== ''
    ? SONGS_LIST.filter(s => s.title.toLowerCase().includes(songSearchQuery.toLowerCase())).slice(0, 5)
    : [];

  const handleSelectSong = (song: SongData, slotIndex: number) => {
    if (selectedSongs.includes(song)) {
      alert("Esta canción ya está en tu top 4");
      return;
    }
    
    const newSongs = [...selectedSongs];
    newSongs[slotIndex] = song;
    setSelectedSongs(newSongs);
    
    setActiveSearchSlot(-1);
    setClosingSlot(-1);
    setSongSearchQuery('');
  };

  const handleRemoveSong = (slotIndex: number) => {
    setRemovingSlot(slotIndex);
    
    setTimeout(() => {
      const newSongs = [...selectedSongs];
      newSongs[slotIndex] = null;
      setSelectedSongs(newSongs);
      setRemovingSlot(-1);
    }, 400);
  };

  const handleCancelSearch = (index: number) => {
    setClosingSlot(index);
    
    setTimeout(() => {
      setActiveSearchSlot(-1);
      setClosingSlot(-1);
      setSongSearchQuery('');
    }, 400);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step">
            <div className="step-header">
              <div className="step-indicator">
                <Dot type="filled" />
                <Dot type="empty" />
                <Dot type="empty" />
                <span className="step-text">1/3</span>
              </div>
              <h2>¿Cuáles son tus imprescindibles?</h2>
              <p>Selecciona al menos a 3 artistas para enterarte de sus novedades y ver qué opina la gente.</p>
            </div>
              <div className="search-dropdown-wrapper">
                <SearchBar 
                  placeholder="¿Falta tu favorito? Búscalo..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery.trim() !== '' && (
                  <div className="search-dropdown-results">
                    {searchResults.length > 0 ? (
                      searchResults.map((artist) => (
                        <div 
                          key={`search-${artist}`} 
                          className="search-result-item"
                          onClick={() => {
                            if (!selectedArtists.includes(artist)) {
                                toggleArtist(artist);
                            }
                            setSearchQuery('');
                          }}
                        >
                          <img src="/placeholderCards.png" alt={artist} />
                          <div>
                            <p className="result-title">{artist}</p>
                            <p className="result-sub">Artista</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="search-result-item" style={{ pointerEvents: 'none' }}>
                        <p className="result-sub">No se encontró el artista "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}
            </div>
            {selectedArtists.length > 0 && (
              <div className="selected-chips-container">
                {selectedArtists.map((artist) => (
                  <div key={`chip-${artist}`} className="artist-chip" onClick={() => toggleArtist(artist)}>
                    <img src="/placeholderCards.png" alt={artist} className="chip-image" />
                    {artist} <span className="chip-remove">&times;</span>
                  </div>
                ))}
              </div>
            )}
            <div className="selected-artists">
              {defaultArtists.map((artist) => (
                <div key={artist} onClick={() => toggleArtist(artist)} style={{ cursor: 'pointer' }}>
                  <ArtistCard 
                    hasScore={false}
                    name={artist} 
                    isSelected={selectedArtists.includes(artist)} 
                  />
                </div>
              ))}
            </div>
            <div className="button-group">
              <Button onClick={nextStep} variant="text">Omitir</Button>
              <Button onClick={nextStep} disabled={selectedArtists.length < 3}>
                Siguiente ({selectedArtists.length}/3)
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step">
            <div className="step-header">
              <div className="step-indicator">
                <Dot type="filled" />
                <Dot type="filled" />
                <Dot type="empty" />
                <span className="step-text">2/3</span>
              </div>
              <h2>Tu top 4 indiscutibles</h2>
              <p>Busca y elige las 4 canciones que te definen. Aparecerán destacadas en tu perfil y las podrás cambiar desde ahí.</p>
            </div>
            <div className="top-songs-grid">
              {selectedSongs.map((song, index) => (
                <div key={`song-slot-${index}`} className="song-slot-container">
                  {song !== null && activeSearchSlot !== index && (
                    <div key={`filled-${song.title}`} className={`filled-slot group ${removingSlot === index ? 'removing' : ''}`}>
                      <MediaCard 
                         title={song.title}
                         type="cancion"
                         artist={song.artist}
                         imageUrl={song.imageUrl}
                         forceShowInfo={true}
                      />
                      <div className="remove-overlay" onClick={() => handleRemoveSong(index)}>
                        <div className="remove-btn-circle">
                           <span className="close-icon">&times;</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeSearchSlot === index && (
                    <div className={`search-slot-active ${closingSlot === index ? 'closing' : ''}`}>
                       <SearchBar 
                          placeholder="Busca tu canción favorita..." 
                          value={songSearchQuery}
                          onChange={(e) => setSongSearchQuery(e.target.value)}
                       />
                       {songSearchQuery.trim() !== '' && (
                         <div className="search-dropdown-results slot-search-dropdown">
                            {searchResultsSongs.length > 0 ? (
                               searchResultsSongs.map((resultSong) => (
                                 <div 
                                    key={`search-song-${resultSong}`}
                                    className="search-result-item"
                                    onClick={() => handleSelectSong(resultSong, index)}
                                 >
                                    <img src={resultSong.imageUrl} alt={resultSong.title} />
                                    <div>
                                      <p className="result-title">{resultSong.title}</p>
                                      <p className="result-sub">{resultSong.artist}</p>
                                    </div>
                                 </div>
                               ))
                            ) : (
                               <div className="search-result-item" style={{ pointerEvents: 'none' }}>
                                 <p className="result-sub">No se encontró "{songSearchQuery}"</p>
                               </div>
                            )}
                         </div>
                       )}
                       <button 
                          className="cancel-search-btn" 
                          onClick={() => handleCancelSearch(index)}
                       >
                          Cancelar
                       </button>
                    </div>
                  )}
                  {song === null && activeSearchSlot !== index && (
                    <div 
                       className="empty-slot" 
                       onClick={() => {
                          setActiveSearchSlot(index);
                          setSongSearchQuery('');
                       }}
                    >
                      <div className="add-circle-btn">
                        <div className="plus-icon">+</div>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
            <div className="button-group">
              <Button onClick={nextStep} variant="text">Omitir</Button>
              <Button 
                onClick={nextStep} 
                disabled={selectedSongs.filter(s => s !== null).length === 0}
              >
                Siguiente
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step step-3">
            <div className="step-header">
              <div className="step-indicator">
                <Dot type="filled" />
                <Dot type="filled" />
                <Dot type="filled" />
                <span className="step-text">3/3</span>
              </div>
              <h2>Deja tu primera RVW</h2>
              <p>Puntúa y cuéntale a la gente que piensas de esta canción que tienes en bucle.</p>
            </div>
            <div className="review-selection-header">
              <span className="review-question">¿Quieres empezar reseñando uno de tus favoritos?</span>
              <div className="review-search-wrapper">
                <SearchBar 
                  placeholder="O busca una diferente..." 
                  value={reviewSearchQuery}
                  onChange={(e) => setReviewSearchQuery(e.target.value)}
                />
                {reviewSearchQuery.trim() !== '' && (
                  <div className="search-dropdown-results">
                    {searchResultsReview.length > 0 ? (
                      searchResultsReview.map((song) => (
                        <div 
                          key={`rev-search-${song.title}`} 
                          className="search-result-item"
                          onClick={() => handleSelectReviewSong(song)}
                        >
                          <img src={song.imageUrl} alt={song.title} />
                          <div>
                            <p className="result-title">{song.title}</p>
                            <p className="result-sub">{song.artist}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="search-result-item" style={{ pointerEvents: 'none' }}>
                        <p className="result-sub">No se encontró "{reviewSearchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {reviewSubStep === 1 ? (
              <div className="review-suggestions-row">
              {suggestedReviewSongs.map((song, idx) => (
                <SmallCard 
                  key={`sugg-${song.title}-${idx}`}
                  type="cancion"
                  title={song.title}
                  artist={song.artist}
                  imageUrl={song.imageUrl}
                  selected={reviewSong?.title === song.title}
                  onClick={() => setReviewSong(song)}
                />
              ))}
            </div>
            ) : (
              <div className="review-form-card fade-in-section">
                <div className="review-form-image">
                  <img src={reviewSong?.imageUrl} alt={reviewSong?.title} />
                </div>
                <div className="review-form-content">
                  <div className="review-form-top">
                    <div className="review-song-info">
                      <span className="sugg-type">Canción</span>
                      <h3>{reviewSong?.title}</h3>
                      <p>{reviewSong?.artist}</p>
                    </div>
                    <div className="review-score-input">
                      <label>Deja tu puntuación</label>
                      <Score 
                        input={true}
                        score={reviewScore}
                        onChange={(newScore) => setReviewScore(newScore)}
                        variant="red"
                      />
                    </div>
                  </div>
                  <div className="review-input-group">
                    <label>Ponle un título a tu RVW</label>
                    <Input
                      type="text"
                      placeholder="Escribe un título breve..." 
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                    />
                  </div>
                  <div className="review-input-group">
                    <label>Escribe tu RVW</label>
                    <TextArea 
                      placeholder="Escribe lo que piensas..." 
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="button-group" style={{ marginTop: '2rem' }}>
              <Button variant="text" onClick={() => {window.location.href="/feed";}}>
                Omitir
              </Button>
              {reviewSubStep === 1 ? (
                <Button 
                  onClick={() => setReviewSubStep(2)} 
                  disabled={!reviewSong}
                >
                  Siguiente
                </Button>
              ) : (
                <Button onClick={() => {window.location.href="/feed";}} disabled={!reviewScore || !reviewTitle || !reviewText} >
                  Publicar e ir al feed
                </Button>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <main className="onboarding-container">
      <div className="step-content fade-in-section">
        {renderStepContent()}
      </div>
    </main>
  );
}