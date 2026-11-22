"use client";

import './page.css';
import MediaCard from '../../components/MediaCard/MediaCard';
import SearchBar from '../../components/SearchBar/SearchBar';
import Button from '../../components/Button/Button';
import { useModal } from '@/context/ModalContext';
import Carousel from '../../components/Carousel/Carousel';
import Rvw from '../../components/Rvw/Rvw';

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
        <h1 className="head-text head-title">Tu opinión sobre música, en una <Rvw>RVW</Rvw></h1>
        <p className="head-text">Puntúa canciones, álbumes y artistas, y comparte tus <Rvw>RVWS</Rvw> con la comunidad</p>
        <p className="head-text">Descubre música nueva a través de lo que escuchan los demás</p>
        <div className="head-actions">
          <Button type="button" variant="primary" onClick={() => openModal('register')}>
            Empieza aquí
          </Button>
          <Button type="button" variant="outline" onClick={() => openModal('login')}>
            Inicia sesión
          </Button>
        </div>
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
        <h2 className="info-title section-title">¿Qué puedes hacer en <Rvw>RVWD</Rvw>?</h2>
        <div className="info">
          <div className="info-card">
            <p className="info-card-text">
              Escribe <Rvw>RVWS</Rvw> de artistas, álbumes y canciones 
              y compártelas con tus amigos.
            </p>
          </div>
          <div className="info-card">
            <p className="info-card-text">
              Sigue a tus artistas favoritos y mira sus <Rvw>RVWS</Rvw>.
            </p>
          </div>
          <div className="info-card">
            <p className="info-card-text">
              Escribe comentarios sobre otras <Rvw>RVWS</Rvw> e inicia conversaciones. 
            </p>
          </div>
          <div className="info-card">
            <p className="info-card-text">
              Sigue a tus amigos y entérate de sus últimas <Rvw>RVWS</Rvw>.
            </p>
          </div>
          <div className="info-card">
            <p className="info-card-text">
              Visualiza las mejores <Rvw>RVWS</Rvw> de tus artistas o álbumes favoritos.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}