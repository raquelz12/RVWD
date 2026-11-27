'use client'; // Los límites de error tienen que ser componentes de cliente

import { fontClasses } from './fonts';
import './globals.css';
import ErrorScreen from './ErrorScreen';

// Errores en el propio layout raíz (header, footer, modales): sustituye al layout, así que va sin header ni footer
// y tiene que poner su <html>, <body>, estilos globales y fuentes
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
    return (
        <html lang="es" className={fontClasses}>
            <body>
                {/* Sin metadata en un componente de cliente: título con la etiqueta de React */}
                <title>Algo ha fallado · RVWD</title>
                <main>
                    <ErrorScreen error={error} retry={retry} />
                </main>
            </body>
        </html>
    );
}
