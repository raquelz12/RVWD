// RVWs de prueba de los perfiles (el tuyo en /profile y el de otros en /user/[username]).
// TODO: vendrá del backend

export interface UserReview {
    id: string;
    /** Con la @ delante */
    author: string;
    type: 'Álbum' | 'Canción';
    title: string;
    artist: string;
    mediaHref: string;
    score: number;
    pageScore: number;
    titleReview: string;
    reviewText: string;
    /** AAAA-MM-DD */
    reviewDate: string;
    commentsCount: number;
    favoritesCount: number;
}

const MOCK_REVIEWS: UserReview[] = [
    { id: '123', author: '@raquelz.12204', type: 'Álbum', title: 'No pasa nada hombre', artist: 'Clarent', mediaHref: '/album/123', score: 8.5, pageScore: 7.8, titleReview: 'Una obra maestra', reviewText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', reviewDate: '2026-11-15', commentsCount: 12, favoritesCount: 34 },
    { id: '124', author: '@raquelz.12204', type: 'Canción', title: 'Jukiar 1', artist: 'Clarent', mediaHref: '/song/1', score: 7, pageScore: 7.4, titleReview: 'Muy pegadiza', reviewText: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', reviewDate: '2026-10-02', commentsCount: 3, favoritesCount: 9 },
    { id: '125', author: '@raquelz.12204', type: 'Álbum', title: 'Motomami', artist: 'Rosalía', mediaHref: '/album/125', score: 9.5, pageScore: 8.9, titleReview: 'Imprescindible', reviewText: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', reviewDate: '2026-08-20', commentsCount: 21, favoritesCount: 58 },
    { id: '126', author: '@raquelz.12204', type: 'Álbum', title: 'El Madrileño', artist: 'C. Tangana', mediaHref: '/album/126', score: 6, pageScore: 8.1, titleReview: 'Me esperaba más', reviewText: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', reviewDate: '2026-06-11', commentsCount: 7, favoritesCount: 4 },
    { id: '127', author: '@raquelz.12204', type: 'Canción', title: 'Jukiar 3', artist: 'Clarent', mediaHref: '/song/3', score: 4.5, pageScore: 6.2, titleReview: 'No es para mí', reviewText: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.', reviewDate: '2026-03-28', commentsCount: 1, favoritesCount: 2 },
    { id: '128', author: '@raquelz.12204', type: 'Álbum', title: 'Jukiar', artist: 'Clarent', mediaHref: '/album/128', score: 8, pageScore: 7.5, titleReview: 'Gran debut', reviewText: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.', reviewDate: '2025-12-05', commentsCount: 5, favoritesCount: 15 },
    { id: '129', author: '@raquelz.12204', type: 'Canción', title: 'Jukiar 4', artist: 'Clarent', mediaHref: '/song/4', score: 10, pageScore: 8.7, titleReview: 'Perfecta', reviewText: 'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.', reviewDate: '2025-09-14', commentsCount: 9, favoritesCount: 27 },

    { id: '201', author: '@lucia.music', type: 'Álbum', title: 'Motomami', artist: 'Rosalía', mediaHref: '/album/125', score: 9, pageScore: 8.9, titleReview: 'Valiente y distinto', reviewText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', reviewDate: '2026-11-02', commentsCount: 6, favoritesCount: 41 },
    { id: '202', author: '@lucia.music', type: 'Canción', title: 'Jukiar 2', artist: 'Clarent', mediaHref: '/song/2', score: 6.5, pageScore: 7.1, titleReview: 'Correcta', reviewText: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', reviewDate: '2026-09-18', commentsCount: 2, favoritesCount: 8 },
    { id: '203', author: '@lucia.music', type: 'Álbum', title: 'El Madrileño', artist: 'C. Tangana', mediaHref: '/album/126', score: 8.5, pageScore: 8.1, titleReview: 'Mezcla perfecta', reviewText: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', reviewDate: '2026-05-30', commentsCount: 11, favoritesCount: 23 },
    { id: '204', author: '@sara.vinilos', type: 'Álbum', title: 'No pasa nada hombre', artist: 'Clarent', mediaHref: '/album/123', score: 7.5, pageScore: 7.8, titleReview: 'Suena genial en vinilo', reviewText: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', reviewDate: '2026-10-21', commentsCount: 4, favoritesCount: 12 },
    { id: '205', author: '@juanp', type: 'Canción', title: 'Jukiar 1', artist: 'Clarent', mediaHref: '/song/1', score: 8, pageScore: 7.4, titleReview: 'Me encanta', reviewText: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.', reviewDate: '2026-07-07', commentsCount: 0, favoritesCount: 3 },
];

export const reviewsBy = (username: string) => MOCK_REVIEWS.filter((r) => r.author === username);
