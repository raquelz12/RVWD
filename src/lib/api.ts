import { mockAlbums, mockArtists, mockSongs } from '@/app/lib/mockData';
import { Album, Artist, Song } from '@/types/music';

/** Solo ids con cifras: parseInt aceptaba "1abc" o "1.5" como el 1 */
const parseId = (id: string): number | null => (/^\d+$/.test(id) ? Number(id) : null);

export async function getAlbumDetails(id: string): Promise<Album | null> {
  const numericId = parseId(id);
  return mockAlbums.find(a => a.id === numericId) || null;
}

export async function getArtistDetails(id: string): Promise<Artist | null> {
  const numericId = parseId(id);
  return mockArtists.find(a => a.id === numericId) || null;
}

export async function getSongDetails(id: string): Promise<Song | null> {
  const numericId = parseId(id);
  return mockSongs.find(s => s.id === numericId) || null;
}
