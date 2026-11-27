import '@/styles/status-page.css';
import './maintenance.css';
import { CONTACT_EMAIL, DEFAULT_MAINTENANCE } from '@/app/lib/siteSettings';

export default function MaintenancePage() {
    // Con backend, el mensaje y la hora vendrán de lo guardado en Admin > Ajustes
    const { message, returnTime } = DEFAULT_MAINTENANCE;

    return (
        <div className="status-page">
            <h1 className="maintenance-title">Estamos haciendo mejoras</h1>
            {!returnTime && (
                <p className="status-description">Volvemos enseguida.</p>
            )}
            <p className="status-description">{message}</p>
            {returnTime && (
                <p className="maintenance-time">Volvemos sobre las {returnTime}</p>
            )}
            {/* Correo y no /contact: durante el mantenimiento el formulario tampoco funciona */}
            <p className="status-helper-text">
                ¿Urgente? Escríbenos a <a href={`mailto:${CONTACT_EMAIL}`} className="inline-link">{CONTACT_EMAIL}</a>.
            </p>
        </div>
    );
}
