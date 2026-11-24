import Link from 'next/link';
import '../../components/Button/Button.css';
import '@/styles/status-page.css';
import './not-found.css';

export default function NotFound() {
    return (
        <div className="status-page">
            <h1 className="not-found-title">404</h1>
            <p className="status-description">
                Esta página no existe
            </p>
            <p className="status-description">
                Puede que el enlace esté roto o que el contenido se haya eliminado.
            </p>
            {/* Enlace con aspecto de botón (un botón dentro de un enlace no es válido) */}
            <Link href="/feed" className="custom-button primary not-found-btn-link">
                Volver al feed
            </Link>
            <p className="status-helper-text">
                ¿Crees que es un error? Avísanos en <Link href="/contact" className="inline-link">Contacto</Link>.
            </p>
        </div>
    );
}
