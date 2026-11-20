export interface Artist {
    id: number;
    name: string;
    pictureUrl: string;
    stats: {
      followers: number;
      favs: number;
      rvws: number;
    }
    score: number;
    songs: Song[];
    albums: Album[];
    rvws: any[];
}

export interface Song {
    id: number;
    name: string;
    coverUrl: string;
    stats: {
      minutes: number;
      favs: number;
      rvws: number;
    }
    score: number;
    album: Album;
    artist: Artist;
    rvws: any[];
    releaseDate: string;
  }

export interface Album {
    id: number;
    name: string;
    coverUrl: string;
    stats: {
      minutes: number;
      favs: number;
      rvws: number;
    }
    score: number;
    songs: Song[];
    artist: Artist;
    rvws: any[];
    releaseDate: string;
}

export interface Review {
    id: number;
    user: User;
    score: number;
    title: string;
    text: string;
    //estado
    type: 'artista' | 'album' | 'cancion';
    //id del artista, album o cancion
    comments: any[];
    date: string;
    //Fecha edicion
}

export interface User {
    id: number;
    name: string;
    lastName: string;
    pictureUrl: string;
    username: string;
    email: string;
    password: string;
    bio: string;
    //privacidad
    //rol
    //email confirmado
    stats: {
      reviews: number;
      followers: number;
      following: number;
    }
    topSongs: Song[];
    //date: string;
    //lastLoginDate: string;
    //usuarios bloqueados
    //preferencias notis
}