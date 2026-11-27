'use client';

import { useSyncExternalStore } from 'react';
import { MOCK_REPORTS } from './mockReports';

// Denuncias que el admin ya ha abierto: las demás salen como nuevas (punto rojo) en el listado.
// Vive en memoria mientras se navega por el panel y vuelve a los datos del mock al recargar.
// TODO: con backend, se guardará por admin en el servidor
const initial: ReadonlySet<string> = new Set(MOCK_REPORTS.filter((r) => r.seen).map((r) => r.id));
let seen = initial;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

export function markReportSeen(id: string) {
    if (seen.has(id)) return;
    seen = new Set(seen).add(id);
    listeners.forEach((listener) => listener());
}

// Con useSyncExternalStore el listado se actualiza aunque Next lo haya conservado oculto al navegar
export function useSeenReports() {
    return useSyncExternalStore(subscribe, () => seen, () => initial);
}
