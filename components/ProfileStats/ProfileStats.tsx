import './ProfileStats.css';
import Rvw from '../Rvw/Rvw';

interface ProfileStatsProps {
    minutes?: number;
    songs?: number;
    favs?: number;
    rvws: number;
    followers?: number;
    following?: number;
    className?: string;
}




export default function ProfileStats( { minutes, songs, favs, rvws, followers, following, className }: ProfileStatsProps ) {
    return (
        <div className={`stats ${className || ''}`}>
            {followers !== undefined && (
                <div className="stat-item">
                    <span className="stat-value">{followers}</span>
                    <span className="stat-label">Seguidores</span>
                </div>
            )}
            {following !== undefined && (
                <div className="stat-item">
                    <span className="stat-value">{following}</span>
                    <span className="stat-label">Siguiendo</span>
                </div>
            )}
            {minutes !== undefined && (
                <div className="stat-item">
                    <span className="stat-value">{minutes}</span>
                    <span className="stat-label">Minutos</span>
                </div>
            )}
            {songs !== undefined && (
                <div className="stat-item">
                    <span className="stat-value">{songs}</span>
                    <span className="stat-label">Canciones</span>
                </div>
            )}
            {favs !== undefined && (
                <div className="stat-item">
                    <span className="stat-value">{favs}</span>
                    <span className="stat-label">Favs</span>
                </div>
            )}
            <div className="stat-item">
                <span className="stat-value">{rvws}</span>
                <Rvw className="stat-label">RVWS</Rvw>
            </div>
        </div>
    );
}