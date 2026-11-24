import Dot from '../../../components/Dot/Dot';
import { MAX_SANCTIONS } from '@/app/lib/adminModeration';

// Sanciones activas de un usuario: puntos rellenos + "2/3".
// Estilos en admin-shared.css (.sanctions-wrapper en listados, .sanctions-counter en fichas)
export default function SanctionDots({ count, className = 'sanctions-wrapper' }: { count: number; className?: string }) {
    const shown = Math.min(count, MAX_SANCTIONS);
    return (
        <span className={className}>
            <span className="sanctions-dots" aria-hidden="true">
                {Array.from({ length: MAX_SANCTIONS }, (_, i) => (
                    <Dot key={i} type={i < shown ? 'filled' : 'empty'} />
                ))}
            </span>
            <span className="sanctions-text">
                {shown}/{MAX_SANCTIONS}
                <span className="sr-only"> sanciones</span>
            </span>
        </span>
    );
}
