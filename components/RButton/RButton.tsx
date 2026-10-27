'use client';

import './RButton.css';

import { useModal } from '@/context/ModalContext';

export default function RButton() {
    const { openModal } = useModal();

    return (
        <button className="r-button" onClick={() => openModal('add')}>
            <img src="/logo.svg" alt="Agregar" className="r-button-icon" />
        </button>
    );
}