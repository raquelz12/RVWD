'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import './RButton.css';

import { useModal } from '@/context/ModalContext';

/* Páginas donde no tiene sentido el botón de crear RVW (en el onboarding ya se crea una en el paso 3) */
const HIDDEN_PATHS = ['/onboarding'];

function RButtonView() {
    const { openModal } = useModal();

    return (
        <button className="r-button" onClick={() => openModal('add')}>
            <img src="/logo.svg" alt="Agregar" className="r-button-icon" />
        </button>
    );
}

function RButtonContent() {
    const pathname = usePathname();

    if (pathname && HIDDEN_PATHS.some((path) => pathname.startsWith(path))) return null;

    return <RButtonView />;
}

// usePathname con cacheComponents necesita un Suspense en rutas dinámicas (como Header y BottomNav)
export default function RButton() {
    return (
        <Suspense fallback={<RButtonView />}>
            <RButtonContent />
        </Suspense>
    );
}
