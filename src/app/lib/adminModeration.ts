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
