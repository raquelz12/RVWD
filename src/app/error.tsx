'use client'; // Los límites de error tienen que ser componentes de cliente

import ErrorScreen from './ErrorScreen';

// Errores inesperados al pintar cualquier página: se ve dentro del layout (con header y footer)
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
    return <ErrorScreen error={error} retry={retry} />;
}
