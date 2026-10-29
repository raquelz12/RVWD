import './SmallCard.css';

export interface SmallCardProps {
    type: 'album' | 'cancion';
    title: string;
    artist: string;
    imageUrl: string;
    selected?: boolean;
    onClick?: () => void;
}

export default function SmallCard({ type, title, artist, imageUrl, selected, onClick }: SmallCardProps) {
    return (
        <article className={`small-card ${selected ? 'selected' : ''}`} onClick={onClick} >
            <div className="small-card-img-wrapper">
                <img src={imageUrl || '/placeholderCards.png'} alt={title} className="small-image" />
            </div>
            <div className="small-info-container">
                <p className="small-type">{type === 'album' ? 'Álbum' : 'Canción'}</p>
                <h4 className="small-title" title={title}>{title}</h4>
                <p className="small-artist">{artist}</p>
            </div>
        </article>
    );
}