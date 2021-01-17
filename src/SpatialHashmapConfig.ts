export default interface SpatialHashmapConfig {
    width: number;
    height: number;
    cellSize: number; // Represents Math.sqrt(numCells)
}