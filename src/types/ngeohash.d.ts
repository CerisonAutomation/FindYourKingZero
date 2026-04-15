declare module 'ngeohash' {
  export function encode(latitude: number, longitude: number, precision?: number): string;
  export function decode(geohash: string): { latitude: number; longitude: number };
  export function decode_bbox(geohash: string): [number, number, number, number];
  export function neighbor(geohash: string, direction: [number, number]): string;
  export function neighbors(geohash: string): string[];
  export function bboxes(minLat: number, minLon: number, maxLat: number, maxLon: number, precision?: number): string[];
  const _default: {
    encode: typeof encode;
    decode: typeof decode;
    decode_bbox: typeof decode_bbox;
    neighbor: typeof neighbor;
    neighbors: typeof neighbors;
    bboxes: typeof bboxes;
  };
  export default _default;
}
