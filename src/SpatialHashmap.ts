import SpatialHashmapConfig from './SpatialHashmapConfig';
import Rectangle from './Rectangle';
import Point from './Point';

/**
 * Data structure to efficiently check for objects that are potentially colliding. 
 * Typically used as a preliminary check before doing more precision collision detection.
 */
export default class SpatialHashmap<MapObject> {
    readonly config: SpatialHashmapConfig;
    readonly grid: Set<MapObject>[][];
    readonly numberOfColumns: number;
    readonly numberOfRows: number;
    readonly numberOfCells: number;

    constructor(config: SpatialHashmapConfig) {
        const cellSizeInverse = 1/config.cellSize;
        
        this.config = config;
        this.numberOfColumns = Math.ceil(config.width  * cellSizeInverse);
        this.numberOfRows = Math.ceil(config.height * cellSizeInverse);
        this.numberOfCells = this.numberOfRows * this.numberOfColumns;
        
        // Use 2D grid for easier debuggability, rather than flat for performance
        const grid: Set<MapObject>[][] = [];
        for (let i = 0; i < config.cellSize; i++) {
            grid.push([])
            for (let j = 0; j < config.cellSize; j++) {
                grid[i][j] = new Set()
            }
        }
        this.grid = grid;
    }

    /**
     * A function oriented approach to constructing the map.
     * Equivalent to doing new SpatialHashmap(...) 
     * @param config
     * @returns new SpatialHashmap
     */
    static create<MapObject>(config: SpatialHashmapConfig) {
        return new SpatialHashmap<MapObject>(config);
    }

    /**
     * Adds an object to the cells that overlap that object within
     * the spatial grid so that it can later be queried for. Object
     * must currently be shaped like a rect
     * @param object
     * @returns SpatialHashmap 
     */
    add(object: MapObject, range: Rectangle): SpatialHashmap<MapObject> {
        const { config, grid } = this;

        if (!isValidRectangle(range)) {
            throw new Error('Attempting to add an object with an invalid range!');
        }

        for (const { x, y } of getCells(range, config)) {
            grid[x][y].add(object);
        }
        
        return this;
    }


    /**
     * Returns the objects that could possibly be touching the
     * supplied range. 
     * @param range 
     */
    getNearby(range: Rectangle): MapObject[] {
        const { grid, config } = this;
        
        if (!isValidRectangle(range) ) {
            throw new Error('Attempting to query nearby objects with invalid range!');
        }
        else if (isOutOfBounds(range, config)) {
            throw new Error('Attempting to query nearby objects with an out of bounds range!');
        }
        
        const seenObjects = new Set();
        const nearbyObjects = [];
        for (const { x, y } of getCells(range, config)) {    
            for (const object of grid[x][y]) {
                if (seenObjects.has(object)) {
                    continue;
                }

                nearbyObjects.push(object);
                seenObjects.add(object)
            }
        }

        return nearbyObjects;
    }

    /**
     * Returns all sets of objects that are possibly colliding
     * @returns Set<MapObject>[]
     */
    getPossiblyCollidingGroups(): Set<MapObject>[] {
        const { grid } = this;
        const possiblyCollidingGroups = [];
        for (const column of grid) {
            for (const objectGroup of column) {
                if (objectGroup.size > 1) {
                    possiblyCollidingGroups.push(objectGroup);
                }
            }
        }
        return possiblyCollidingGroups;
    }
}


function getCells(range: Rectangle, config: SpatialHashmapConfig): Point[] {
    const rectCorners = getRectCorners(range);
    const [minCellX, minCellY] = getCellId(config, rectCorners.topLeft);
    const [maxCellX, maxCellY] = getCellId(config, rectCorners.bottomRight);
    const cellIds = [];
    for (let x = minCellX; x <= maxCellX; x++) {
        for (let y = minCellY; y <= maxCellY; y++) {
            cellIds.push({ x, y });
        }
    }
    return cellIds;
}

function getCellId(config: SpatialHashmapConfig, point: Point): [number, number] {
    const percentageThroughWidth = point.x / config.width;
    const percentageThroughHeight = point.y / config.height;
    return [
        clamp(Math.floor(percentageThroughWidth * config.cellSize), 0, config.cellSize - 1),
        clamp(Math.floor(percentageThroughHeight * config.cellSize), 0, config.cellSize - 1),
    ];
}

function getRectCorners(rectangle: Rectangle) {
    const { x, y, width, height } = rectangle;
    return {
        topLeft: { x, y },
        topRight: { x: (x + width), y },
        bottomLeft: { x, y: (y + height) },
        bottomRight: { x: (x + width), y: (y + height) },
    };
}

function isValidRectangle(rectangle: any) {
    return (
        rectangle && 
        Number.isFinite(rectangle.x) && 
        Number.isFinite(rectangle.y) &&
        Number.isFinite(rectangle.width) &&
        Number.isFinite(rectangle.height)
    );
}

function isOutOfBounds(range: Rectangle, config: SpatialHashmapConfig) {
    const isWidthOutOfBounds = range.x > config.width || (range.x + range.width) < 0;
    const isHeightOutOfBounds = range.y > config.height || (range.y + range.height) < 0;
    return isWidthOutOfBounds && isHeightOutOfBounds;
}

function clamp(value: number, lower: number, upper: number) {
    value = value <= upper ? value : upper;
    value = value >= lower ? value : lower;
    return value;
}