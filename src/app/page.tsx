"use client";

import './page.css';
import MediaCard from '../../components/MediaCard/MediaCard';
import SearchBar from '../../components/SearchBar/SearchBar';
import Button from '../../components/Button/Button';
import { useModal } from '@/context/ModalContext';
import Carousel from '../../components/Carousel/Carousel';

export default function Home() {
  const { openModal } = useModal();
  const topRvws = [1, 2, 3, 4];

  // Las mismas tarjetas para ordenador (en fila) y móvil (en carrusel)
  const novedades = topRvws.map((id) => (
    <MediaCard
      key={id}
      type="album"
      title="No pasa nada hombre"
      artist="Clarent"
      imageUrl="/placeholderCards.png"
      userName="@raquelz.12204"
      userPicture="/placeholderCards.png"
      score={8.5}
      forceShowInfo={true}
      href="/reviews/123"
    />
  ));

  return (
    <main className="body-landing-page">
      <div className="head">
        <h1 className="head-text head-title">Descubre tus nuevos gustos</h1>
        <p className="head-text">Comparte tus opiniones con la comunidad</p>
        <p className="head-text">Escribe <span className="RVWS">RVWS</span> de tus artistas, álbumes y canciones favoritas</p>
        <Button variant="primary" onClick={() => openModal('register') }>
          Empieza aquí
        </Button>
      </div>
      <div className="new">
        <h2 className="new-title section-title">Novedades</h2>
        {/* Ordenador */}
        <div className="desktop-view-novedades">
            {novedades}
        </div>
        {/* Movil*/}
        <div className="mobile-view-novedades">
            <Carousel>
              {novedades}
            </Carousel>
        </div>
      </div>
      <div className="search">
        <p className="search-title">Busca canciones, artistas, álbumes...</p>
        <SearchBar placeholder="Buscar..." value="" onChange={(): void => {}} />
      </div>
      <div className="info-wrapper">
        <h2 className="info-title section-title">¿Qué puedes hacer en <span className="RVWS">RVWD</span>?</h2>
        <div className="info">
          <div className="info-card">
            <p className="info-card-text">
              Escribe <span className="RVWS">RVWS</span> de artistas, álbumes y canciones 
              y compártelas con tus amigos.
            </p>
          </div>
          <div className="info-card">
            <p className="info-card-text">
              Sigue a tus artistas favoritos y mira sus <span className="RVWS">RVWS</span>.
            </p>
          </div>
          <div className="info-card">
            <p className="info-card-text">
              Escribe comentarios sobre otras <span className="RVWS">RVWS</span> e inicia conversaciones. 
            </p>
          </div>
          <div className="info-card">
            <p className="info-card-text">
              Sigue a tus amigos y entérate de sus últimas <span className="RVWS">RVWS</span>.
            </p>
          </div>
          <div className="info-card">
            <p className="info-card-text">
              Visualiza las mejores <span className="RVWS">RVWS</span> de tus artistas o álbumes favoritos.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}