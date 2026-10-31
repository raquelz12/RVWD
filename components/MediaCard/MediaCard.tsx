'use client';

import './MediaCard.css';
import Score from '../Score/Score';

export interface MediaCardProps {
  userName?: string;
  userPicture?: string;
  score?: number;
  type: 'album' | 'cancion' | 'artista';
  title: string;
  artist: string;
  imageUrl: string;
  forceShowInfo?: boolean;
}

//Ejemplo para pegar en otros lados:
// Con score:
// <MediaCard
//   type="cancion"
//   title="Jukiar"
//   artist="Clarent"
//   imageUrl="placeholderCards.png"
//   userName="@raquelz.12204"
//   userPicture="placeholderCards.png"
//   score={85}
//   forceShowInfo={true}
// />
// Sin score:
// <MediaCard
//   type="album"
//   title="Jukiar"
//   artist="Clarent"
//   imageUrl="placeholderCards.png"
//   userName="@raquelz.12204"
//   userPicture="placeholderCards.png"
//   forceShowInfo={true}
// />

export default function MediaCard({ type, title, artist, imageUrl, userName, userPicture, score, forceShowInfo }: MediaCardProps) {
  return (
    <article className={`media-card ${type === 'artista' ? 'is-artist' : ''} ${forceShowInfo ? 'force-show-info' : ''}`}>
      {score && (
          <div className="media-score-position">
            <Score input={false} score={score} variant="red" />
          </div>
        )}
      <div className="media-image-container">
        {userName && (
          <div className="user-badge-pill">
            <img src={userPicture || '/placeholderCards.png'} className="user-picture" alt={userName} />
            <span className="user-name">{userName}</span>
          </div>
        )}
        <div className="image-wrapper">
          <img src={imageUrl || '/placeholderCards.png'} alt={title} className="media-image" />
          {type !== 'artista' && (
            <div className="image-gradient-info">
              <h3 className="gradient-title" title={title}>{title}</h3>
              <p className="gradient-type">{type === 'album' ? 'Álbum' : 'Canción'}</p>
            </div>
          )}
        </div>
        <div className="artist-red-bar">
          <span className="bar-icon-user"></span> 
          <span className="bar-artist-name">{artist}</span>
        </div>
      </div>
    </article>
  );
}