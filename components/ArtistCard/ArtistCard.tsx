'use client';

import Link from 'next/link';
import Button from '../Button/Button';
import Score from '../Score/Score';
import './ArtistCard.css';

export interface ArtistCardProps {
  name: string;
  imageUrl?: string;
  isSelected?: boolean;
  /** Enseña el botón "Seguir" (para artistas que aún no sigues) */
  showFollow?: boolean;
  hasScore?: boolean;
  score?: number;
  variant?: 'red' | 'white';
  /** Si se pasa, la tarjeta entera es un enlace a esta ruta */
  href?: string;
}

export default function ArtistCard({ name, imageUrl, isSelected, showFollow, hasScore, score, variant, href }: ArtistCardProps) {
  const card = (
    <div className={`artist-card ${isSelected ? 'selected' : ''}`}>
      <div className="artist-image">
        <img src={imageUrl || '/placeholderCards.png'} alt={name} />
      </div>
      <div className="artist-name">{name}</div>
      {hasScore && score !== undefined && score !== null &&
        <Score variant={variant} input={false} className="score" score={score} />
      }
      {showFollow && (
        <Button
          className="follow-button"
          onClick={(e) => {
            // Dentro del enlace: seguir no debe llevar a la página del artista
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          Seguir
        </Button>
      )}
    </div>
  );

  return href ? <Link href={href} className="artist-card-link">{card}</Link> : card;
}
