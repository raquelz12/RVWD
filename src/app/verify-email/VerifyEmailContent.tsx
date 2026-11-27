'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import { CONTACT_EMAIL } from '../lib/siteSettings';
import { isValidEmail } from '../lib/passwordReset';
import { VERIFY_LINK_DURATION, type VerifyTokenStatus } from '../lib/emailVerification';

const CONFIRMED: Record<'confirmed' | 'email-changed', { title: string; text: string; href: string; action: string }> = {
    confirmed: {
        title: 'Correo confirmado',
        text: 'Tu cuenta ya está lista. Cuéntanos qué música te gusta para preparar tu feed.',
        href: '/onboarding',
        action: 'Configurar mi perfil',
    },
    'email-changed': {
        title: 'Tu nuevo correo está confirmado',
        text: 'A partir de ahora te escribiremos a esta dirección.',
        href: '/settings',
        action: 'Volver a ajustes',
    },
};

const LINK_ERRORS: Record<'expired' | 'invalid', { title: string; text: string }> = {
    expired: {
        title: 'Este enlace ha caducado',
        text: `Por seguridad, los enlaces para confirmar el correo duran ${VERIFY_LINK_DURATION}. Pide uno nuevo y ábrelo desde el último correo que te enviemos.`,
    },
    invalid: {
        title: 'Este enlace no es válido',
        text: 'Puede que esté incompleto o que ya lo hayas usado. Escribe tu correo y te enviaremos uno nuevo.',
    },
};

export default function VerifyEmailContent({ status }: { status: VerifyTokenStatus }) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    // Con el enlace nuevo enviado se ve el aviso en vez del botón o el formulario
    const [sent, setSent] = useState(false);
    const sentRef = useRef<HTMLParagraphElement>(null);

    // Al enviar desaparece el botón que tenía el foco: se lleva al aviso (y el lector lo lee)
    useEffect(() => {
        if (sent) sentRef.current?.focus();
    }, [sent]);

    if (status === 'confirmed' || status === 'email-changed') {
        const { title, text, href, action } = CONFIRMED[status];
        return (
            <>
                <h1 className="page-title">{title}</h1>
                <p className="status-description">{text}</p>
                {/* Enlace con aspecto de botón (un botón dentro de un enlace no es válido) */}
                <Link href={href} className="custom-button primary status-action">{action}</Link>
            </>
        );
    }

    const { title, text } = LINK_ERRORS[status];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidEmail(email)) {
            setError('Escribe un email válido.');
            return;
        }
        // TODO: pedir al backend un correo de confirmación nuevo para ese email (y mostrar su error si falla)
        setSent(true);
    };

    const resend = () => {
        // TODO: pedir al backend un correo nuevo para la cuenta del token caducado (y mostrar su error si falla)
        setSent(true);
    };

    let action: React.ReactNode;
    if (sent) {
        action = (
            <p ref={sentRef} className="success-message verify-email-sent" tabIndex={-1}>
                {/* Sin token válido no sabemos de quién es: mismo texto haya cuenta o no, como en recuperar contraseña */}
                <span>
                    {status === 'expired' ? (
                        'Te hemos enviado un enlace nuevo al correo de tu cuenta.'
                    ) : (
                        <>
                            Si hay una cuenta sin confirmar con <strong className="verify-email-address">{email.trim()}</strong>, te hemos enviado un enlace nuevo.
                        </>
                    )}{' '}
                    Caduca en {VERIFY_LINK_DURATION}. Si no lo ves, mira también en la carpeta de spam.
                </span>
            </p>
        );
    } else if (status === 'expired') {
        action = (
            <Button type="button" className="status-action" onClick={resend}>
                Enviar un enlace nuevo
            </Button>
        );
    } else {
        action = (
            <form onSubmit={handleSubmit} className="verify-email-form" noValidate>
                <div className="verify-email-field">
                    <label htmlFor="verify-email-input" className="form-label">Correo electrónico*</label>
                    <Input
                        id="verify-email-input"
                        type="email"
                        autoComplete="email"
                        aria-required="true"
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? 'verify-email-error' : undefined}
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setError('');
                        }}
                        placeholder="tu@correo.com"
                    />
                </div>
                {error && (
                    <p id="verify-email-error" className="form-error" role="alert">
                        {error}
                    </p>
                )}
                <p className="required-fields-note">* Campos obligatorios</p>
                <Button type="submit" className="status-action">Enviar enlace</Button>
            </form>
        );
    }

    return (
        <>
            <h1 className="page-title">{title}</h1>
            <p className="status-description">{text}</p>
            {action}
            <p className="status-helper-text">
                ¿Sigues con problemas? Escríbenos a <a href={`mailto:${CONTACT_EMAIL}`} className="inline-link">{CONTACT_EMAIL}</a>.
            </p>
        </>
    );
}
