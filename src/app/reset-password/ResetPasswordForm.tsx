'use client';

import { useEffect, useRef, useState } from 'react';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import { useModal } from '@/context/ModalContext';
import { CONTACT_EMAIL } from '../lib/siteSettings';
import {
    newPasswordError,
    PASSWORD_MIN_LENGTH,
    RESET_LINK_DURATION,
    type ResetTokenStatus,
} from '../lib/passwordReset';

const LINK_ERRORS: Record<Exclude<ResetTokenStatus, 'valid'>, { title: string; text: string }> = {
    invalid: {
        title: 'Este enlace no es válido',
        text: 'Puede que esté incompleto o que ya lo hayas usado. Pide uno nuevo y ábrelo desde el último correo que te enviemos.',
    },
    expired: {
        title: 'Este enlace ha caducado',
        text: `Por seguridad, los enlaces para cambiar la contraseña duran ${RESET_LINK_DURATION}. Pide uno nuevo y úsalo cuanto antes.`,
    },
};

export default function ResetPasswordForm({ status }: { status: ResetTokenStatus }) {
    const { openModal } = useModal();
    const [password, setPassword] = useState('');
    const [repeat, setRepeat] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const titleRef = useRef<HTMLHeadingElement>(null);

    // Al guardar desaparece el formulario (y el botón con el foco): el foco pasa al título nuevo
    useEffect(() => {
        if (saved) titleRef.current?.focus();
    }, [saved]);

    const help = (
        <p className="status-helper-text">
            ¿Sigues sin poder entrar? Escríbenos a <a href={`mailto:${CONTACT_EMAIL}`} className="inline-link">{CONTACT_EMAIL}</a>.
        </p>
    );

    if (status !== 'valid') {
        const { title, text } = LINK_ERRORS[status];
        return (
            <>
                <h1 className="page-title">{title}</h1>
                <p className="status-description">{text}</p>
                <Button type="button" className="status-action" onClick={() => openModal('forgot')}>
                    Pedir un enlace nuevo
                </Button>
                {help}
            </>
        );
    }

    if (saved) {
        return (
            <>
                <h1 ref={titleRef} className="page-title status-focus-title" tabIndex={-1}>Contraseña cambiada</h1>
                <p className="status-description">Ya puedes iniciar sesión con tu contraseña nueva.</p>
                <Button type="button" className="status-action" onClick={() => openModal('login')}>
                    Iniciar sesión
                </Button>
            </>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const message = newPasswordError(password, repeat);
        if (message) {
            setError(message);
            return;
        }
        // TODO: guardar la contraseña con el backend (y mostrar su error si el token ya no vale)
        setPassword('');
        setRepeat('');
        setSaved(true);
    };

    const edit = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
        setError('');
    };

    return (
        <>
            <h1 className="page-title">Crea una contraseña nueva</h1>
            <p className="status-description">Elige una contraseña que no uses en otras webs.</p>
            <form onSubmit={handleSubmit} className="reset-password-form" noValidate>
                <div className="reset-password-field">
                    <label htmlFor="reset-password-new" className="form-label">Nueva contraseña*</label>
                    <Input
                        id="reset-password-new"
                        type="password"
                        autoComplete="new-password"
                        aria-required="true"
                        aria-describedby={error ? 'reset-password-hint reset-password-error' : 'reset-password-hint'}
                        aria-invalid={error && password.length < PASSWORD_MIN_LENGTH ? true : undefined}
                        value={password}
                        onChange={edit(setPassword)}
                        placeholder="••••••••"
                    />
                    <p id="reset-password-hint" className="reset-password-hint">Mínimo {PASSWORD_MIN_LENGTH} caracteres</p>
                </div>
                <div className="reset-password-field">
                    <label htmlFor="reset-password-repeat" className="form-label">Repite la contraseña*</label>
                    <Input
                        id="reset-password-repeat"
                        type="password"
                        autoComplete="new-password"
                        aria-required="true"
                        aria-describedby={error ? 'reset-password-error' : undefined}
                        aria-invalid={error && password.length >= PASSWORD_MIN_LENGTH ? true : undefined}
                        value={repeat}
                        onChange={edit(setRepeat)}
                        placeholder="••••••••"
                    />
                </div>
                {error && (
                    <p id="reset-password-error" className="form-error" role="alert">
                        {error}
                    </p>
                )}
                <p className="required-fields-note">* Campos obligatorios</p>
                <Button type="submit" className="status-action">Guardar contraseña</Button>
            </form>
            {help}
        </>
    );
}
