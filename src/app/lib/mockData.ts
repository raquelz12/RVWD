import { Artist, Album, Song, User, Review } from '@/types/music'; // Ajusta la ruta

// 1. Creamos el Usuario
const user1: User = {
  id: 1,
  name: 'Raquel',
  lastName: 'Arnaiz',
  pictureUrl: '/placeholderCards.png',
  username: 'raquel_dev',
  email: 'raquel@example.com',
  password: 'hashed_password',
  bio: 'Software Engineer & Music Lover',
  stats: {
    reviews: 1,
    followers: 120,
    following: 150
  },
  topSongs: [] 
};

const artist1: Artist = {
  id: 1,
  name: 'Clarent',
  pictureUrl: '/placeholderCards.png',
  stats: {
    followers: 5000000,
    favs: 300000,
    rvws: 15000
  },
  score: 9.6,
  songs: [],
  albums: [],
  rvws: [],
};

const album1: Album = {
  id: 101,
  name: 'No pasa nada hombre',
  coverUrl: '/placeholderCards.png',
  stats: {
    minutes: 42,
    favs: 85000,
    rvws: 4200
  },
  score: 9.8,
  songs: [],
  artist: artist1,
  rvws: [],
  releaseDate: '2022-03-18'
};

const song1: Song = {
  id: 1001,
  name: 'Jukiar',
  coverUrl: '/placeholderCards.png',
  stats: {
    minutes: 2.3,
    favs: 12000,
    rvws: 800
  },
  score: 9.4,
  album: album1,
  artist: artist1,
  rvws: [],
  releaseDate: '2022-02-04'
};

const song2: Song = {
  id: 1002,
  name: 'Gra Gra Boom 2',
  coverUrl: '/placeholderCards.png',
  stats: {
    minutes: 3.1,
    favs: 15000,
    rvws: 950
  },
  score: 9.2,
  album: album1,
  artist: artist1,
  rvws: [],
  releaseDate: '2022-03-18'
};

const song3: Song = {
  id: 1003,
  name: 'Úsame',
  coverUrl: '/placeholderCards.png',
  stats: {
    minutes: 2.5,
    favs: 150,
    rvws: 95
  },
  score: 9.6,
  album: album1,
  artist: artist1,
  rvws: [],
  releaseDate: '2022-03-18'
};

const song4: Song = {
  id: 1004,
  name: 'Escrito en piedra',
  coverUrl: '/placeholderCards.png',
  stats: {
    minutes: 3,
    favs: 100,
    rvws: 90
  },
  score: 8.6,
  album: album1,
  artist: artist1,
  rvws: [],
  releaseDate: '2022-03-18'
};

const review1: Review = {
  id: 5001,
  user: user1,
  score: 10,
  title: 'Obra maestra vanguardista',
  text: 'La producción de este álbum rompe todos los esquemas...',
  type: 'album',
  comments: [],
  date: '2022-03-20T14:30:00Z'
};


artist1.albums.push(album1);
artist1.songs.push(song1, song2, song3, song4);

album1.songs.push(song1, song2, song3, song4);
album1.rvws.push(review1);

user1.topSongs.push(song1);

// TODO: vendrán del backend. Más artistas (cada uno con un álbum y sus canciones)
// para que el buscador y las fichas tengan algo con lo que probar
interface ExtraArtist {
  artistId: number;
  artistName: string;
  score: number;
  album: { id: number; name: string; releaseDate: string; score: number };
  songs: { id: number; name: string; minutes: number; score: number }[];
}

const EXTRA_ARTISTS: ExtraArtist[] = [
  {
    artistId: 2, artistName: 'Rosalía', score: 9.1,
    album: { id: 102, name: 'Motomami', releaseDate: '2022-03-18', score: 9.0 },
    songs: [
      { id: 1005, name: 'Saoko', minutes: 2.3, score: 8.9 },
      { id: 1006, name: 'Candy', minutes: 3.1, score: 8.7 },
      { id: 1007, name: 'Despechá', minutes: 2.6, score: 9.2 },
    ],
  },
  {
    artistId: 3, artistName: 'C. Tangana', score: 8.8,
    album: { id: 103, name: 'El Madrileño', releaseDate: '2021-02-26', score: 9.3 },
    songs: [
      { id: 1008, name: 'Tú me dejaste de querer', minutes: 3.3, score: 9.1 },
      { id: 1009, name: 'Comerte entera', minutes: 3.6, score: 8.8 },
    ],
  },
  {
    artistId: 4, artistName: 'Bad Bunny', score: 8.9,
    album: { id: 104, name: 'Un Verano Sin Ti', releaseDate: '2022-05-06', score: 8.9 },
    songs: [
      { id: 1010, name: 'Ojitos Lindos', minutes: 4.3, score: 9.0 },
      { id: 1011, name: 'Me Porto Bonito', minutes: 2.9, score: 8.6 },
    ],
  },
];

const extraArtists: Artist[] = [];
const extraAlbums: Album[] = [];
const extraSongs: Song[] = [];

for (const extra of EXTRA_ARTISTS) {
  const artist: Artist = {
    id: extra.artistId,
    name: extra.artistName,
    pictureUrl: '/placeholderCards.png',
    stats: { followers: 1000000, favs: 50000, rvws: 3000 },
    score: extra.score,
    songs: [],
    albums: [],
    rvws: [],
  };
  const album: Album = {
    id: extra.album.id,
    name: extra.album.name,
    coverUrl: '/placeholderCards.png',
    stats: { minutes: 40, favs: 20000, rvws: 1200 },
    score: extra.album.score,
    songs: [],
    artist,
    rvws: [],
    releaseDate: extra.album.releaseDate,
  };
  const songs: Song[] = extra.songs.map((s) => ({
    id: s.id,
    name: s.name,
    coverUrl: '/placeholderCards.png',
    stats: { minutes: s.minutes, favs: 5000, rvws: 300 },
    score: s.score,
    album,
    artist,
    rvws: [],
    releaseDate: extra.album.releaseDate,
  }));
  album.songs.push(...songs);
  artist.albums.push(album);
  artist.songs.push(...songs);
  extraArtists.push(artist);
  extraAlbums.push(album);
  extraSongs.push(...songs);
}

export const mockArtists: Artist[] = [artist1, ...extraArtists];
export const mockAlbums: Album[] = [album1, ...extraAlbums];
export const mockSongs: Song[] = [song1, song2, song3, song4, ...extraSongs];
export const mockUsers: User[] = [user1];
export const mockReviews: Review[] = [review1];