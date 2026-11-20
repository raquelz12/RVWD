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
  score: 4.8,
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
  score: 4.9,
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
  score: 4.7,
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
  score: 4.6,
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
  score: 5,
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

export const mockArtists: Artist[] = [artist1];
export const mockAlbums: Album[] = [album1];
export const mockSongs: Song[] = [song1, song2, song3, song4];
export const mockUsers: User[] = [user1];
export const mockReviews: Review[] = [review1];