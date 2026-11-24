'use client';

import { useSyncExternalStore } from 'react';
import { MOCK_INBOX } from './mockInbox';

// Mensajes que el admin ya ha leído: lo comparten el listado y la ficha.
// Vive en memoria mientras se navega por el panel y vuelve a los datos del mock al recargar.
// TODO: con backend, se guardará por admin en el servidor
const initial: ReadonlySet<string> = new Set(MOCK_INBOX.filter((m) => m.read).map((m) => m.id));
let read = initial;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

const update = (ids: Iterable<string>, isRead: boolean) => {
    const next = new Set(read);
    for (const id of ids) {
        if (isRead) next.add(id);
        else next.delete(id);
    }
    if (next.size === read.size && [...next].every((id) => read.has(id))) return;
    read = next;
    listeners.forEach((listener) => listener());
};

export const markRead = (ids: Iterable<string>) => update(ids, true);
export const markUnread = (ids: Iterable<string>) => update(ids, false);

// Con useSyncExternalStore el listado se actualiza aunque Next lo haya conservado oculto al navegar
export function useReadInbox() {
    return useSyncExternalStore(subscribe, () => read, () => initial);
}
