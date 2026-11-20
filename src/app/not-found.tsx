import Link from 'next/link';
import Button from '../../components/Button/Button';
import './not-found.css';

export default function NotFound() {
    return (
        <div className="not-found-container">
            <span className="not-found-title">404</span>
            <p className="not-found-description">
                Esta página no existe
            </p>
            <p className="not-found-description">
                Puede que el enlace esté roto o que el contenido se haya eliminado.
            </p>
            <Link href="/" style={{ textDecoration: 'none' }}>
                <Button variant="primary">Volver al Feed</Button>
            </Link>
            <p className="not-found-helper-text">
                ¿Crees que es un error? Avísanos en <Link href="/contact">Contacto</Link>.
            </p>
        </div>
    );
}