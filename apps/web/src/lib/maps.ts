// Gamechanger #17 — PMTiles: serve vector tiles from a single CDN file, zero tile server
// Zero API keys, zero per-request cost, works offline
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';

let installed = false;

export function installPMTiles(): void {
  if (installed) return;
  const protocol = new Protocol();
  maplibregl.addProtocol('pmtiles', protocol.tile);
  installed = true;
}

// Free basemap style — Protomaps dark theme, perfect for FYK dark UI
export const DARK_MAP_STYLE = {
  version: 8 as const,
  glyphs: 'https://cdn.protomaps.com/fonts/pbf/{fontstack}/{range}.pbf',
  sources: {
    protomaps: {
      type: 'vector' as const,
      url: 'pmtiles://https://build.protomaps.com/20240618.pmtiles',
      attribution: '© <a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
    },
  },
};
