'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from '../../components/Button/Button';
import { isAdminPath } from './lib/adminNav';
import '../../components/Button/Button.css';
import '@/styles/status-page.css';
import './error.css';

// Contenido común a error.tsx (dentro del layout) y global-error.tsx (cuando falla el propio layout)
export default function ErrorScreen({ error, retry }: { error: unknown; retry: () => void }) {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const pathname = usePathname();
    const inAdmin = isAdminPath(pathname);

    // Errores del servidor: en producción llegan sin mensaje, solo con este código para buscarlos en los logs
    const digest = error instanceof Error && 'digest' in error && typeof error.digest === 'string' ? error.digest : null;

    useEffect(() => {
        // TODO backend: mandar el error a un servicio de registro de errores
        console.error(error);
        // El contenido de la página ha desaparecido: el foco al título para que el lector anuncie el error
        titleRef.current?.focus();
    }, [error]);

    return (
        <div className="status-page">
            <h1 ref={titleRef} className="page-title status-focus-title" tabIndex={-1}>Algo ha fallado</h1>
            <p className="status-description">
                No hemos podido cargar esta página. Puede ser algo puntual: prueba otra vez en unos segundos.
            </p>
            <div className="error-page-actions">
                <Button type="button" className="status-action" onClick={() => retry()}>
                    Intentar de nuevo
                </Button>
                {/* Enlace con aspecto de botón (un botón dentro de un enlace no es válido) */}
                <Link href={inAdmin ? '/admin/dashboard' : '/feed'} className="custom-button outline status-action">
                    {inAdmin ? 'Volver al panel' : 'Volver al feed'}
                </Link>
            </div>
            <p className="status-helper-text">
                Si sigue pasando, avísanos en <Link href="/contact" className="inline-link">Contacto</Link>
                {digest ? ' e incluye este código:' : '.'}
            </p>
            {digest && (
                <p className="status-helper-text error-page-code">
                    Código del error: <code>{digest}</code>
                </p>
            )}
        </div>
    );
}
