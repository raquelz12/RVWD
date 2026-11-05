"use client";

import { useState } from 'react';
import './page.css';
import MediaCard from '../../components/MediaCard/MediaCard';
import SearchBar from '../../components/SearchBar/SearchBar';
import Button from '../../components/Button/Button';
import { useModal } from '@/context/ModalContext';
import Carousel from '../../components/Carousel/Carousel';

export default function Home() {
  const { openModal } = useModal();
  const topRvws = [1, 2, 3, 4];

  return (
    <main className="body-landing-page">
      <div className="head">
        <p className="head-text">Descubre tus nuevos gustos</p>
        <p className="head-text">Comparte tus opiniones con la comunidad</p>
        <p className="head-text">Escribe ЯVWS de tus artistas, álbumes y canciones favoritas</p>
        <Button variant="primary" onClick={() => openModal('register') }>
          Empieza aquí
        </Button>
      </div>
      <div className="new">
        <p className="new-title">Novedades</p>
        {/* Ordenador */}
        <div className="desktop-view-novedades">
            {topRvws.map((item, index) => (
                <MediaCard
                  key={`desktop-${index}`}
                  type="album"
                  title="No pasa nada hombre"
                  artist="Clarent"
                  imageUrl="/placeholderCards.png"
                  userName="@raquelz.12204"
                  userPicture="/placeholderCards.png"
                  score={8.5}
                  forceShowInfo={true}
                />
            ))}
        </div>
        {/* Movil*/}
        <div className="mobile-view-novedades">
            <Carousel>
              {topRvws.map((item, index) => (
                  <MediaCard
                    key={`mobile-${index}`}
                    type="album"
                    title="No pasa nada hombre"
                    artist="Clarent"
                    imageUrl="/placeholderCards.png"
                    userName="@raquelz.12204"
                    userPicture="/placeholderCards.png"
                    score={8.5}
                    forceShowInfo={true}
                  />
              ))}
            </Carousel>
        </div>
      </div>
      <div className="search">
        <p className="search-title">Busca canciones, artistas, álbumes...</p>
        <SearchBar placeholder="Buscar..." value="" onChange={(): void => {}} />
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