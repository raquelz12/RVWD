import { Suspense } from 'react';
import { checkResetToken } from '../lib/passwordReset';
import ResetPasswordForm from './ResetPasswordForm';
import '@/styles/status-page.css';
import '@/styles/forms.css';
import './reset-password.css';

type SearchParams = Promise<{ token?: string | string[] }>;

/** Página a la que lleva el enlace del correo de recuperar contraseña: /reset-password?token=... */
export default function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
    // Con cacheComponents, los searchParams solo se conocen en runtime, así que van dentro de un Suspense
    return (
        <main className="status-page status-page-narrow">
            <Suspense fallback={<p className="status-description" role="status">Comprobando el enlace…</p>}>
                <ResetPasswordContent searchParams={searchParams} />
            </Suspense>
        </main>
    );
}

async function ResetPasswordContent({ searchParams }: { searchParams: SearchParams }) {
    const { token } = await searchParams;
    // TODO: con backend, la comprobación es una llamada (y su estado de error)
    return <ResetPasswordForm status={checkResetToken(token)} />;
}
