"use client";

import { useState, useRef } from 'react';
import './page.css';
import MediaCard from '../../components/MediaCard/MediaCard';
import SearchBar from '../../components/SearchBar/SearchBar';
import Button from '../../components/Button/Button';

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

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

  const paginationLetters = ['Я', 'V', 'W', 'D'];

  return (
    <main className="body-landing-page">
      <div className="head">
        <p className="head-text">Descubre tus nuevos gustos</p>
        <p className="head-text">Comparte tus opiniones con la comunidad</p>
        <p className="head-text">Escribe ЯVWS de tus artistas, álbumes y canciones favoritas</p>
        <Button variant="primary" onClick={() => { /* Acción al hacer clic */ }}>
          Empieza aquí
        </Button>
      </div>
      <div className="new">
        <p className="new-title">Novedades</p>
        <div className="carousel-wrapper">
          <div className="new-cards" ref={carouselRef} onScroll={handleScroll}>
            <div className="carousel-item">
              <MediaCard type="album" title="Álbum 1" artist="Artista 1" imageUrl="/placeholderCards.png" />
            </div>
            <div className="carousel-item">
              <MediaCard type="cancion" title="Canción 2" artist="Artista 2" imageUrl="/placeholderCards.png" />
            </div>
            <div className="carousel-item">
              <MediaCard type="cancion" title="Canción 3" artist="Artista 3" imageUrl="/placeholderCards.png" />
            </div>
            <div className="carousel-item">
              <MediaCard type="album" title="Álbum 4" artist="Artista 4" imageUrl="/placeholderCards.png" />
            </div>
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
      </div>
      <div className="search">
        <p className="search-title">Busca canciones, artistas, álbumes...</p>
        <SearchBar placeholder="Buscar..."/>
      </div>
      <div className="info-wrapper">
        <div className="info-title">¿Qué puedes hacer en ЯVWD?</div>
        <div className="info">
          <div className="info-card">
            <p className="info-card-text">
              Escribe ЯVWS de artistas, álbumes y canciones 
              y compártelas con tus amigos.
            </p>
          </div>
          <div className="info-card">
            <p className="info-card-text">
              Seguir a tus cantantes favoritos y ver sus ЯVWS.
            </p>
          </div>
          <div className="info-card">
            <p className="info-card-text">
              Escribe comentarios sobre otras ЯVWS e inicia conversaciones. 
            </p>
          </div>
          <div className="info-card">
            <p className="info-card-text">
              Sigue a tus amigos y enterate de sus últimas ЯVWS.
            </p>
          </div>
          <div className="info-card">
            <p className="info-card-text">
              Visualiza las mejores ЯVWS de tus artistas o álbumes favoritos.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}