import { Suspense } from 'react';
import { checkVerifyToken } from '../lib/emailVerification';
import VerifyEmailContent from './VerifyEmailContent';
import '@/styles/status-page.css';
import '@/styles/forms.css';
import './verify-email.css';

type SearchParams = Promise<{ token?: string | string[] }>;

/** Página a la que lleva el enlace del correo al registrarse o al cambiar el email: /verify-email?token=... */
export default function VerifyEmailPage({ searchParams }: { searchParams: SearchParams }) {
    // Con cacheComponents, los searchParams solo se conocen en runtime, así que van dentro de un Suspense
    return (
        <main className="status-page status-page-narrow">
            <Suspense fallback={<p className="status-description" role="status">Comprobando el enlace…</p>}>
                <VerifyEmailStatus searchParams={searchParams} />
            </Suspense>
        </main>
    );
}

async function VerifyEmailStatus({ searchParams }: { searchParams: SearchParams }) {
    const { token } = await searchParams;
    // TODO: con backend, la comprobación es una llamada (y su estado de error)
    return <VerifyEmailContent status={checkVerifyToken(token)} />;
}
