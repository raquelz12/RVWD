'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import './RButton.css';

import { useModal } from '@/context/ModalContext';
import { isAdminPath } from '@/app/lib/adminNav';

/* Páginas donde no tiene sentido el botón de crear RVW (en el onboarding ya se crea una en el paso 3;
   en /admin el admin no publica RVWs) */
const HIDDEN_PATHS = ['/onboarding'];

function RButtonView() {
    const { openModal } = useModal();

    return (
        <button type="button" className="r-button" onClick={() => openModal('add')} aria-label="Crear RVW">
            <img src="/logo.svg" alt="" className="r-button-icon" />
        </button>
    );
}

function RButtonContent() {
    const pathname = usePathname();

    if (isAdminPath(pathname) || (pathname && HIDDEN_PATHS.some((path) => pathname.startsWith(path)))) return null;

    return <RButtonView />;
}

// usePathname con cacheComponents necesita un Suspense en rutas dinámicas (como Header y BottomNav).
// Sin fallback: hasta saber la ruta no se sabe si toca mostrarlo (en /admin no)
export default function RButton() {
    return (
        <Suspense fallback={null}>
            <RButtonContent />
        </Suspense>
    );
}
