import Link from 'next/link';
import '../../components/Button/Button.css';
import './not-found.css';

export default function NotFound() {
    return (
        <div className="not-found-container">
            <h1 className="not-found-title">404</h1>
            <p className="not-found-description">
                Esta página no existe
            </p>
            <p className="not-found-description">
                Puede que el enlace esté roto o que el contenido se haya eliminado.
            </p>
            {/* Enlace con aspecto de botón (un botón dentro de un enlace no es válido) */}
            <Link href="/feed" className="custom-button primary not-found-btn-link">
                Volver al feed
            </Link>
            <p className="not-found-helper-text">
                ¿Crees que es un error? Avísanos en <Link href="/contact">Contacto</Link>.
            </p>
        </div>
    );
}