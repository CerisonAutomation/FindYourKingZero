// =====================================================
// Loro CRDT Sync for Shared Album Metadata
// Offline-first collaborative albums
// =====================================================
import { LoroDoc, LoroMap } from 'loro-crdt';

let doc: LoroDoc | null = null;
let albumMap: LoroMap | null = null;

export async function initLoroAlbum(albumId: string) {
  if (!doc) {
    doc = new LoroDoc();
    albumMap = doc.getMap('album');
  }
  return { doc, albumMap };
}

export function addToSharedAlbum(fileMetadata: { name: string; url: string; type: string; size: number }) {
  if (!albumMap || !doc) return;
  const files = albumMap.get('files') || [];
  const updated = [...(Array.isArray(files) ? files : []), { ...fileMetadata, addedAt: Date.now() }];
  albumMap.set('files', updated);
  return doc.export();
}

export function getAlbumFiles(): any[] {
  if (!albumMap) return [];
  const files = albumMap.get('files');
  return Array.isArray(files) ? files : [];
}

export function importSnapshot(snapshot: Uint8Array) {
  if (doc) doc.import(snapshot);
}

export function exportSnapshot(): Uint8Array | null {
  return doc ? doc.export() : null;
}
