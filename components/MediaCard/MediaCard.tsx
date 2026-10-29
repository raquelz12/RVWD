import './MediaCard.css';

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

export default function MediaCard({ type, title, artist, imageUrl, userName, userPicture, score, forceShowInfo }: MediaCardProps) {
  return (
    <article className={`media-card ${type === 'artista' ? 'is-artist' : ''} ${forceShowInfo ? 'force-show-info' : ''}`}>
      <div className="media-image-container">
        {userName && (
          <div className="user-badge-pill">
            <img src={userPicture || '/placeholderCards.png'} className="user-picture" alt={userName} />
            <span className="user-name">{userName}</span>
          </div>
        )}
        {score && (
          <div className="score-badge">
            {score}
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