'use client';

// Botón Seguir / Solicitado / Siguiendo de un usuario. Lo usan el perfil público y las listas de seguidores.
// Es controlado: quien lo usa guarda el estado (el perfil lo necesita para enseñar o no el contenido privado)

import { useState } from 'react';
import './FollowButton.css';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import Rvw from '../Rvw/Rvw';
import type { FollowState } from '@/app/lib/publicUsers';

const FOLLOW_LABEL: Record<FollowState, string> = {
    no: 'Seguir',
    solicitado: 'Solicitado',
    siguiendo: 'Siguiendo',
};

/** Texto para lectores de pantalla, con el @usuario (en una lista hay muchos botones iguales) */
const FOLLOW_ARIA: Record<FollowState, (username: string) => string> = {
    no: (u) => `Seguir a ${u}`,
    solicitado: (u) => `Solicitado seguir a ${u}`,
    siguiendo: (u) => `Siguiendo a ${u}`,
};

interface FollowButtonProps {
    username: string;
    isPrivate: boolean;
    state: FollowState;
    onChange: (state: FollowState) => void;
    className?: string;
}

export default function FollowButton({ username, isPrivate, state, onChange, className = '' }: FollowButtonProps) {
    const [confirmUnfollow, setConfirmUnfollow] = useState(false);

    // TODO: seguir / pedir seguir de verdad cuando haya backend
    // Pública: seguir / dejar de seguir. Privada: pedirlo, cancelar la petición o dejar de seguir
    const toggle = () => {
        // En una privada, dejar de seguir oculta su contenido y volver exige otra solicitud: se pregunta antes
        if (isPrivate && state === 'siguiendo') setConfirmUnfollow(true);
        else if (state !== 'no') onChange('no');
        else onChange(isPrivate ? 'solicitado' : 'siguiendo');
    };

    const unfollow = () => {
        onChange('no');
        setConfirmUnfollow(false);
    };

    // id único por usuario: en una lista puede haber varios botones
    const titleId = `follow-button-unfollow-${username.replace(/[^\w-]/g, '')}`;

    return (
        <>
            <Button
                type="button"
                variant={state === 'no' ? 'primary' : 'outline'}
                className={`follow-button ${className}`.trim()}
                aria-pressed={state !== 'no'}
                aria-label={FOLLOW_ARIA[state](username)}
                onClick={toggle}
            >
                {FOLLOW_LABEL[state]}
            </Button>
            <Modal isOpen={confirmUnfollow} onClose={() => setConfirmUnfollow(false)} labelledBy={titleId}>
                <div className="follow-button-modal">
                    <div className="follow-button-modal-header">
                        <h2 className="section-title" id={titleId}>¿Dejar de seguir a {username}?</h2>
                        <p className="follow-button-modal-text">
                            Su cuenta es privada: dejarás de ver sus canciones favoritas y sus <Rvw>RVWS</Rvw>, y para volver a seguirle tendrás que enviarle otra solicitud.
                        </p>
                    </div>
                    <div className="follow-button-modal-actions">
                        <Button type="button" variant="text" onClick={() => setConfirmUnfollow(false)}>
                            Cancelar
                        </Button>
                        <Button type="button" variant="danger" onClick={unfollow}>
                            Dejar de seguir
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
