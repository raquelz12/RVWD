import './maintenance.css';
import Link from 'next/link';

export default function MaintenancePage() {
  return (
        <div className="maintenance-container">
            <span className="maintenance-title">Estamos haciendo mejoras</span>
            <p className="maintenance-description">
                Volvemos enseguida.
            </p>
            <p className="maintenance-description">
                Estamos actualizando la página para que funcione mejor.
            </p>
            <span className="maintenance-subtitle">Volvemos sobre las 18:00</span>
            <p className="maintenance-helper-text">
                ¿Urgente? Avísanos en <Link href="/contact">Contacto</Link>.
            </p>
        </div>
    );
}