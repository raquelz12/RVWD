'use client';

import Button from '../Button/Button';
import Score from '../Score/Score';
import './ArtistCard.css';

export interface ArtistCardProps {
  name: string;
  isSelected?: boolean;
  followed?: boolean;
  hasScore?: boolean;
  score?: number;
  variant?: 'red' | 'white';
}

export default function ArtistCard({ name, isSelected, followed, hasScore, score, variant }: ArtistCardProps) {
  return (
    <div className={`artist-card ${isSelected ? 'selected' : ''}`}>
      <div className="artist-image">
        <img src="/placeholderCards.png" alt={name} />
      </div>
      <div className="artist-name">{name}</div>
      {hasScore && score !== undefined && score !== null &&
        <Score variant={variant} input={false} className="score" score={score} />
      }
      {followed && <Button className="follow-button" onClick={() => {}}>Seguir</Button>}
    </div>
  );
}