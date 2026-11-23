import { useSyncExternalStore } from 'react';

const subscribeMinute = (onChange: () => void) => {
    const timer = setInterval(onChange, 60_000);
    return () => clearInterval(timer);
};
const getMinute = () => Math.floor(Date.now() / 60_000);
const getServerMinute = () => null;

/** Minuto actual (Date.now() / 60 000), se actualiza cada minuto.
 *  En el prerender y en la primera pintada es null: así no se lee la hora en el servidor
 *  y las fechas relativas ("Hace 5 minutos") no dan error de hidratación */
export function useNowMinute() {
    return useSyncExternalStore(subscribeMinute, getMinute, getServerMinute);
}
