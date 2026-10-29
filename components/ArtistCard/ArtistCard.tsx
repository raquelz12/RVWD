import Button from '../Button/Button';
import Score from '../Score/Score';
import './ArtistCard.css';

export interface ArtistCardProps {
  name: string;
  isSelected?: boolean;
  followed?: boolean;
  score?: number;
}

export default function ArtistCard({ name, isSelected, followed, score }: ArtistCardProps) {
  return (
    <div className={`artist-card ${isSelected ? 'selected' : ''}`}>
      {score !== undefined && (
        <Score score={score} />
      )}
      <div className="artist-image">
        <img src="/placeholderCards.png" alt={name} />
      </div>
      <div className="artist-name">{name}</div>
      {followed && <Button onClick={() => {}}>Seguir</Button>}
    </div>
  );
}