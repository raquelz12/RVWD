import Link from 'next/link';
import './ProfileStats.css';
import Rvw from '../Rvw/Rvw';

interface ProfileStatsProps {
    minutes?: number;
    songs?: number;
    favs?: number;
    rvws: number;
    followers?: number;
    following?: number;
    /** Lista de seguidores / seguidos (solo perfiles de usuario; en artistas no se pasa) */
    followersHref?: string;
    followingHref?: string;
    className?: string;
}

/** Forma compacta para que la fila quepa: 950 · 15 mil · 1,2 M (con decimales solo si aportan) */
const formatCompact = (n: number) => {
    const short = (value: number, unit: string) =>
        `${(Math.round(value * 10) / 10).toString().replace('.', ',')} ${unit}`;
    if (n >= 1_000_000) return short(n / 1_000_000, 'M');
    if (n >= 10_000) return short(n / 1_000, 'mil');
    return n.toString().replace('.', ',');
};

/** Seguidores / Siguiendo: con href se puede pulsar para ver la lista */
function StatItem({ value, label, href }: { value: number; label: string; href?: string }) {
    const content = (
        <>
            <span className="stat-value">{formatCompact(value)}</span>
            <span className="stat-label">{label}</span>
        </>
    );
    return href ? (
        <Link href={href} className="stat-item stat-item-link">{content}</Link>
    ) : (
        <div className="stat-item">{content}</div>
    );
}

export default function ProfileStats( { minutes, songs, favs, rvws, followers, following, followersHref, followingHref, className }: ProfileStatsProps ) {
    return (
        <div className={`stats ${className || ''}`}>
            {followers !== undefined && (
                <StatItem value={followers} label="Seguidores" href={followersHref} />
            )}
            {following !== undefined && (
                <StatItem value={following} label="Siguiendo" href={followingHref} />
            )}
            {minutes !== undefined && (
                <div className="stat-item">
                    <span className="stat-value">{formatCompact(minutes)}</span>
                    <span className="stat-label">Minutos</span>
                </div>
            )}
            {songs !== undefined && (
                <div className="stat-item">
                    <span className="stat-value">{formatCompact(songs)}</span>
                    <span className="stat-label">Canciones</span>
                </div>
            )}
            {favs !== undefined && (
                <div className="stat-item">
                    <span className="stat-value">{formatCompact(favs)}</span>
                    <span className="stat-label">Favs</span>
                </div>
            )}
            <div className="stat-item">
                <span className="stat-value">{formatCompact(rvws)}</span>
                <Rvw className="stat-label">RVWS</Rvw>
            </div>
        </div>
    );
}
