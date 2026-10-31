'use client';

import './ReviewBigCard.css';
import Score from '../Score/Score';
import { profile } from 'console';

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
    profile?: boolean;
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
    favoritesCount,
    profile
}: ReviewBigCardProps) {
    return (
        <div className="review-big-card">
            {userImageUrl && username && followed !== undefined && (
                <div className="review-big-card-header">
                    <div className="review-big-card-user">
                        <img src={userImageUrl} alt={username} />
                        <div className="review-big-card-user-info">
                            <p className="user-name">{username}</p>
                            <p className="user-followed">{followed ? 'Le sigues' : 'No le sigues'}</p>
                        </div>
                    </div>
                    <div className="review-big-card-extra">
                        <button className="review-big-card-extra-btn">
                            ...
                        </button>
                    </div>
                </div>
            )}
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
                        {profile && (
                        <div className="review-big-card-score">
                            <div className="review-big-card-score-wrapper">
                                <p className="review-big-card-score-text">Tu puntuación</p>
                                <Score variant="red" input={false} score={parseFloat(score?.toString() || '0')} />
                            </div>
                            <div className="review-big-card-score-wrapper">
                            <p className="review-big-card-score-text">
                                    <span className="RVWS">RVWD</span>score
                                </p>
                                <Score variant="white" input={false} score={parseFloat(score?.toString() || '0')} />
                            </div>
                        </div>
                        ) || (
                            <div className="review-big-card-score">
                                <Score variant="red" input={false} score={parseFloat(score?.toString() || '0')} />
                            </div>
                        )}
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