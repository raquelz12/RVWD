// Perfiles públicos de los usuarios (lo que ve otro usuario en /user/[username]).
// TODO: vendrá del backend. Los ids y nombres coinciden con los de admin (admin/users/mockUsers.ts)
// para que "Ver perfil público" lleve a un perfil que exista.

export interface TopSong {
    id: string;
    title: string;
    artist: string;
    imageUrl: string;
}

/** Relación del usuario de la sesión con este perfil */
export type FollowState = 'no' | 'solicitado' | 'siguiendo';

export interface PublicUser {
    id: string;
    /** Con la @ delante, como se enseña en toda la web */
    username: string;
    name: string;
    avatarUrl: string;
    bio: string;
    privacy: 'publica' | 'privada';
    /** Desactivada: el usuario la ha cerrado o un admin la ha suspendido o baneado. Solo se ve el @usuario */
    status: 'activa' | 'desactivada';
    follow: FollowState;
    stats: { followers: number; following: number; rvws: number };
    topSongs: (TopSong | null)[];
}

/** El usuario conectado. TODO: saldrá de la sesión cuando haya autenticación */
export const SESSION_USERNAME = '@raquelz.12204';

const song = (id: string, title: string, artist: string): TopSong => ({ id, title, artist, imageUrl: '/placeholderCards.png' });

const BIO = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes.';

const USERS: PublicUser[] = [
    {
        id: '2', username: '@lucia.music', name: 'Lucía Martín', avatarUrl: '/placeholder.png', bio: BIO,
        privacy: 'publica', status: 'activa', follow: 'no',
        stats: { followers: 1240, following: 310, rvws: 318 },
        topSongs: [song('1', 'Jukiar 1', 'Clarent'), song('5', 'Motomami', 'Rosalía'), song('6', 'El Madrileño', 'C. Tangana'), song('3', 'Jukiar 3', 'Clarent')],
    },
    {
        id: '7', username: '@clarent', name: 'Clarent', avatarUrl: '/placeholder.png', bio: BIO,
        privacy: 'publica', status: 'activa', follow: 'siguiendo',
        stats: { followers: 15400, following: 87, rvws: 42 },
        topSongs: [song('2', 'Jukiar 2', 'Clarent'), null, song('4', 'Jukiar 4', 'Clarent'), null],
    },
    {
        id: '8', username: '@juanp', name: 'Juan Pérez', avatarUrl: '/placeholder.png', bio: BIO,
        privacy: 'privada', status: 'activa', follow: 'no',
        stats: { followers: 58, following: 112, rvws: 9 },
        topSongs: [song('1', 'Jukiar 1', 'Clarent'), null, null, null],
    },
    {
        id: '3', username: '@marcos_rvw', name: 'Marcos Gil', avatarUrl: '/placeholder.png', bio: BIO,
        privacy: 'privada', status: 'activa', follow: 'solicitado',
        stats: { followers: 230, following: 198, rvws: 127 },
        topSongs: [null, null, null, null],
    },
    {
        id: '4', username: '@sara.vinilos', name: 'Sara Vidal', avatarUrl: '/placeholder.png', bio: BIO,
        privacy: 'privada', status: 'activa', follow: 'siguiendo',
        stats: { followers: 402, following: 377, rvws: 96 },
        topSongs: [song('5', 'Motomami', 'Rosalía'), song('2', 'Jukiar 2', 'Clarent'), song('6', 'El Madrileño', 'C. Tangana'), null],
    },
    {
        id: '5', username: '@quevedo.20', name: 'Quevedo', avatarUrl: '/placeholder.png', bio: '',
        privacy: 'publica', status: 'desactivada', follow: 'no',
        stats: { followers: 0, following: 0, rvws: 0 },
        topSongs: [null, null, null, null],
    },
    {
        id: '6', username: '@resenas.gratis', name: 'Reseñas Gratis', avatarUrl: '/placeholder.png', bio: '',
        privacy: 'publica', status: 'desactivada', follow: 'no',
        stats: { followers: 0, following: 0, rvws: 0 },
        topSongs: [null, null, null, null],
    },
];

/** Todos los perfiles (para el buscador) */
export const listPublicUsers = (): readonly PublicUser[] => USERS;

/** El trozo de la URL tal cual o, si viene codificado (%40...), descodificado */
export const slugFromParam = (raw: string) => {
    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
};

/** "@lucia.music" → "lucia.music" (el trozo de la URL) */
export const usernameSlug = (username: string) => username.replace(/^@/, '');

/** Enlace al perfil de un usuario; el propio lleva a /profile, que es donde se edita */
export const userHref = (username: string) =>
    username === SESSION_USERNAME ? '/profile' : `/user/${encodeURIComponent(usernameSlug(username))}`;

/** Busca por el trozo de la URL; acepta también la @ delante y no distingue mayúsculas */
export function findPublicUser(slug: string): PublicUser | null {
    const wanted = `@${usernameSlug(slug).toLowerCase()}`;
    return USERS.find((u) => u.username.toLowerCase() === wanted) ?? null;
}

export const isSessionUser = (slug: string) =>
    `@${usernameSlug(slug).toLowerCase()}` === SESSION_USERNAME.toLowerCase();

/** Se ve todo el perfil si está activo y es público, o es privado y ya le sigues */
export const canSeeProfile = (user: PublicUser, follow: FollowState = user.follow) =>
    user.status === 'activa' && (user.privacy === 'publica' || follow === 'siguiendo');
