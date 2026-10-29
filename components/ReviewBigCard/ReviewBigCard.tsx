import './ReviewBigCard.css';

import Score from '../Score/Score';

interface ReviewBigCardProps {
    username?: string;
    userImageUrl?: string;
    followed?: boolean;
    type?: 'Álbum' | 'Canción' | 'Artista';
    title?: string;
    artist?: string;
    imageUrl?: string;
    score?: number;
    titleReview?: string;
    reviewText?: string;
    reviewDate?: string;
    commentsCount?: number;
    favoritesCount?: number;
}

export default function ReviewBigCard({
    username,
    userImageUrl,
    followed,
    type,
    title,
    artist,
    imageUrl,
    score,
    titleReview,
    reviewText,
    reviewDate,
    commentsCount,
    favoritesCount
}: ReviewBigCardProps) {
    return (
        <div className="review-big-card">
            <div className="review-big-card-header">
                <div className="review-big-card-user">
                    <img src={userImageUrl} alt={username} />
                    <div className="review-big-card-user-info">
                        <p className="user-name">{username}</p>
                        <p className="user-followed">{followed ? 'Siguiendo' : 'No siguiendo'}</p>
                    </div>
                </div>
                <button className="review-big-card-extra-btn">
                    ...
                </button>
            </div>
            <div className="review-big-card-content">
                <div className="review-big-card-image">
                    <img src={imageUrl} alt={title} />
                </div>
                <div className="review-big-card-info">
                    <div className="review-big-card-header">
                        <div className="review-big-card-header-info">
                            <p className="review-big-card-type">{type}</p>
                            <p className="review-big-card-title">{title}</p>
                            <p className="review-big-card-artist">{artist}</p>
                        </div>
                        <div className="review-big-card-score">
                            <Score score={parseFloat(score?.toString() || '0')} />
                        </div>
                    </div>
                    <div className="review-big-card-review">
                        <span className="title">{titleReview}</span>
                        <span className="text">{reviewText}</span>
                    </div>
                    <div className="review-big-card-footer">
                        <p>{reviewDate}</p>
                        <div className="review-big-card-footer-stats">
                            <button className="review-big-card-footer-btn" onClick={() => {}}>
                                {commentsCount} <img src="/comments-solid-full.svg" alt="Comentarios" />
                            </button>
                        <button className="review-big-card-footer-btn" onClick={() => {}}>
                                {favoritesCount} <img src="/star-regular-full.svg" alt="Favoritos" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}