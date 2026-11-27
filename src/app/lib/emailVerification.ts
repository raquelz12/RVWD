/* Confirmar email: maqueta del enlace del correo (al registrarse y al cambiar el email en Ajustes) */

/** Lo que dura el enlace del correo (se dice en los textos) */
export const VERIFY_LINK_DURATION = '24 horas';

/** confirmed: cuenta nueva; email-changed: email nuevo de Ajustes */
export type VerifyTokenStatus = 'confirmed' | 'email-changed' | 'expired' | 'invalid';

/** Tokens de prueba: /verify-email?token=caducado y /verify-email?token=cambio */
const MOCK_EXPIRED_TOKEN = 'caducado';
const MOCK_EMAIL_CHANGE_TOKEN = 'cambio';

/**
 * Estado del enlace del correo (/verify-email?token=...).
 * Maqueta: sin token, no válido; «caducado», caducado; «cambio», email de Ajustes confirmado;
 * cualquier otro, cuenta confirmada (p. ej. ?token=demo).
 * TODO: comprobar el token con el backend (si ya se usó, si es de registro o de cambio de email)
 */
export function checkVerifyToken(token: string | string[] | undefined): VerifyTokenStatus {
    // ?token=a&token=b: se toma el primero, como en reset-password
    const value = (Array.isArray(token) ? token[0] : token)?.trim() ?? '';
    if (value === '') return 'invalid';
    if (value === MOCK_EXPIRED_TOKEN) return 'expired';
    if (value === MOCK_EMAIL_CHANGE_TOKEN) return 'email-changed';
    return 'confirmed';
}
