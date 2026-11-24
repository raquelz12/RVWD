// Ajustes de la web que se editan desde Admin > Ajustes y se leen en las páginas públicas.
// De momento son constantes; con backend vendrán de la API.

export const CONTACT_EMAIL = 'rvwd@gmail.com';

// Lo que se ve en /maintenance (mensaje y hora aproximada de vuelta; la hora puede quedar vacía)
export const DEFAULT_MAINTENANCE = {
    message: 'Estamos actualizando la página para que funcione mejor.',
    returnTime: '18:00',
};
