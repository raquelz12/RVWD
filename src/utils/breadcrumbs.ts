import { Artist, Album, Song } from '@/types/music';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

type MusicEntity = Artist | Album | Song;

export function generateBreadcrumbs(type: 'artist' | 'album' | 'song', data: MusicEntity): BreadcrumbItem[] {
  const base = [{ label: 'Feed', href: '/feed' }];

  switch (type) {
    case 'artist':
      const artistData = data as Artist;
      return [
        ...base,
        { label: artistData.name }
      ];

    case 'album':
      const albumData = data as Album;
      return [
        ...base,
        { label: albumData.artist.name, href: `/artist/${albumData.artist.id}` },
        { label: albumData.name }
      ];

    case 'song':
      const songData = data as Song;
      return [
        ...base,
        { label: songData.artist.name, href: `/artist/${songData.artist.id}` },
        { label: songData.album.name, href: `/album/${songData.album.id}` },
        { label: songData.name }
      ];

    default:
      return base;
  }
}