'use client';

import Score from '../Score/Score';
import './SmallCard.css';

export interface SmallCardProps {
    type: 'album' | 'cancion';
    title: string;
    artist: string;
    imageUrl: string;
    selected?: boolean;
    score?: number | string;
    onClick?: () => void;
    variant?: 'small' | 'large';
}

export default function SmallCard({ type, title, artist, imageUrl, selected, score, onClick, variant }: SmallCardProps) {
    return (
        <article className={`small-card ${selected ? 'selected' : ''} ${variant || 'small'}`} onClick={onClick} >
            <div className="small-card-wrapper">
                <div className="small-card-img-wrapper">
                    <img src={imageUrl || '/placeholderCards.png'} alt={title} className="small-image" />
                </div>
                <div className="small-info-container">
                    <p className="small-type">{type === 'album' ? 'Álbum' : 'Canción'}</p>
                    <h4 className="small-title" title={title}>{title}</h4>
                    <p className="small-artist">{artist}</p>
                </div>
            </div>
            {score !== undefined && <Score input={false} score={score} variant="white" />}
        </article>
    );
}
