export const WALL_CHUNK_SIZE = 1200;
export const WALL_VIEWPORT_BUFFER = 480;

export function getChunkBounds(chunkX: number, chunkY: number, chunkSize = WALL_CHUNK_SIZE) {
  return {
    minX: chunkX * chunkSize,
    maxX: (chunkX + 1) * chunkSize,
    minY: chunkY * chunkSize,
    maxY: (chunkY + 1) * chunkSize
  };
}
