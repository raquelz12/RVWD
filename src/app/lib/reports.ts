// Denuncias que hacen los usuarios (RVWs, comentarios y perfiles).
// Los valores son los mismos que usa admin en sus filtros de denuncias; el label es el texto para el usuario.

export type ReportContentType = 'RVW' | 'Comentario' | 'Perfil';

export type ReportReason = 'Spam' | 'Palabras inapropiadas' | 'Acoso' | 'Mal uso';

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
    { value: 'Spam', label: 'Spam o publicidad' },
    { value: 'Palabras inapropiadas', label: 'Lenguaje inapropiado' },
    { value: 'Acoso', label: 'Acoso o falta de respeto' },
    { value: 'Mal uso', label: 'Otro mal uso' },
];

/** Lo que se denuncia: tipo, id y autor (para enseñarlo en el modal) */
export interface ReportTarget {
    type: ReportContentType;
    id: string;
    author: string;
}

export const REPORT_DETAILS_MAX = 500;
