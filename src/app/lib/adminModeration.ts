// Opciones de moderación compartidas por las páginas de admin.

export const SANCTION_REASONS = [
    { value: 'Spam', label: 'Spam' },
    { value: 'Lenguaje inapropiado', label: 'Lenguaje inapropiado' },
    { value: 'Acoso', label: 'Acoso o falta de respeto' },
    { value: 'Plagio', label: 'Plagio de contenido' },
    { value: 'Contenido inapropiado', label: 'Contenido inapropiado' },
];

// Motivo de denuncia -> motivo de sanción equivalente (para precargar el modal)
export const REPORT_TO_SANCTION_REASON: Record<string, string> = {
    'Spam': 'Spam',
    'Palabras inapropiadas': 'Lenguaje inapropiado',
    'Acoso': 'Acoso',
    'Mal uso': 'Contenido inapropiado',
};

// Al llegar a este número de sanciones activas se banea la cuenta
export const MAX_SANCTIONS = 3;

export const BAN_REASONS = [
    { value: '3 strikes', label: '3 strikes' },
    { value: 'Discurso de odio', label: 'Discurso de odio' },
    { value: 'Amenazas / Estafa', label: 'Amenazas o estafa' },
    { value: 'Bots / Review bombing', label: 'Bots / Review bombing' },
];

export const SUSPEND_DURATIONS = [
    { value: '3 días', label: '3 días' },
    { value: '7 días', label: '7 días' },
    { value: '15 días', label: '15 días' },
    { value: '30 días', label: '30 días' },
];

// Días que tarda en caducar una sanción (Ajustes de admin > Reglas de moderación)
export const SANCTION_EXPIRY_DAYS = 90;

// Días de suspensión automática con la penúltima sanción
export const AUTO_SUSPEND_DAYS = 7;
