import { mockAlbums, mockArtists, mockSongs } from '@/app/lib/mockData';
import { Album, Artist, Song } from '@/types/music';

export async function getAlbumDetails(id: string): Promise<Album | null> {
  const numericId = parseInt(id, 10);
  const album = mockAlbums.find(a => a.id === numericId);
  return album || null;
}

export async function getArtistDetails(id: string): Promise<Artist | null> {
  const numericId = parseInt(id, 10);
  return mockArtists.find(a => a.id === numericId) || null;
}

export async function getSongDetails(id: string): Promise<Song | null> {
  const numericId = parseInt(id, 10);
  const song = mockSongs.find(s => s.id === numericId);
  return song || null;
}