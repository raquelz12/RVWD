/* Recuperar contraseña: validaciones comunes y maqueta del enlace del correo */

/** Mínimo de caracteres de una contraseña (el mismo que en Admin > Ajustes) */
export const PASSWORD_MIN_LENGTH = 8;

/** Lo que dura el enlace del correo (se dice en los textos) */
export const RESET_LINK_DURATION = '1 hora';

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

/** Error de la contraseña nueva, o '' si está bien */
export function newPasswordError(password: string, repeat: string): string {
    if (password.length < PASSWORD_MIN_LENGTH) return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
    if (password !== repeat) return 'Las contraseñas no coinciden.';
    return '';
}

export type ResetTokenStatus = 'valid' | 'expired' | 'invalid';

/** Token de prueba que da el enlace caducado: /reset-password?token=caducado */
const MOCK_EXPIRED_TOKEN = 'caducado';

/**
 * Estado del enlace del correo (/reset-password?token=...).
 * Maqueta: sin token, no válido; con «caducado», caducado; cualquier otro, válido (p. ej. ?token=demo).
 * TODO: comprobar el token con el backend (y si ya se usó)
 */
export function checkResetToken(token: string | string[] | undefined): ResetTokenStatus {
    // ?token=a&token=b: se toma el primero, como en la búsqueda
    const value = (Array.isArray(token) ? token[0] : token)?.trim() ?? '';
    if (value === '') return 'invalid';
    if (value === MOCK_EXPIRED_TOKEN) return 'expired';
    return 'valid';
}
