import SpatialHashmap from './SpatialHashmap';

describe('SpatialHashmap', () => {
    let spatialHashmap: SpatialHashmap<any>;

    beforeEach(() => {
        spatialHashmap = SpatialHashmap.create({ 
                            width: 100,
                            height: 100, 
                            cellSize: 10 
                        });
    })

    it('should correctly return one cell object', () => {
        const value = {};
        const rect = { x: 0, y: 0, width: 10, height: 10 };
        const pointsToCheck = [
            {
                queryPoint: { x: 0, y: 0, width: 1, height: 1 },
                expectedResult: [value],
            },
            {
                queryPoint: { x: 20, y: 0, width: 1, height: 1 },
                expectedResult: [],
            },
            {
                queryPoint: { x: 0, y: 20, width: 1, height: 1 },
                expectedResult: [],
            },
        ];
        
        spatialHashmap.add(value, rect);

        for (const { queryPoint, expectedResult } of pointsToCheck) {
            expect(
                spatialHashmap.getNearby(queryPoint)
            ).toEqual(expectedResult);
        }
    });

    it('should correctly return multi-cell object', () => {
        const value = {};
        const rect = { x: 0, y: 0, width: 20, height: 20 };
        const pointsToCheck = [
            {
                queryPoint: { x: 0, y: 0, width: 1, height: 1 },
                expectedResult: [value],
            },
            {
                queryPoint: { x: 0, y: 10, width: 1, height: 1 },
                expectedResult: [value],
            },
            {
                queryPoint: { x: 10, y: 0, width: 1, height: 1 },
                expectedResult: [value],
            },
            {
                queryPoint: { x: 10, y: 10, width: 1, height: 1 },
                expectedResult: [value],
            },
            {
                queryPoint: { x: 20, y: 0, width: 1, height: 1 },
                expectedResult: [value],
            },
            { // TODO: should we check inclusive on edge?
                queryPoint: { x: 0, y: 20, width: 1, height: 1 },
                expectedResult: [value],
            },
            {
                queryPoint: { x: 30, y: 0, width: 1, height: 1 },
                expectedResult: [],
            },
            {
                queryPoint: { x: 0, y: 30, width: 1, height: 1 },
                expectedResult: [],
            },
        ];


        spatialHashmap.add(value, rect);

        for (const { queryPoint, expectedResult } of pointsToCheck) {
            expect(
                spatialHashmap.getNearby(queryPoint)
            ).toEqual(expectedResult);
        }
        
    });
    
    it('should allow adding partially covering object', () => {
        const value = {};
        const rect = { x: -10, y: -20, width: 10, height: 10 };
        const pointsToCheck = [
            {
                queryPoint: { x: -1, y: -1, width: 10, height: 10 },
                expectedResult: [value],
            },
        ];
        
        spatialHashmap.add(value, rect);

        for (const { queryPoint, expectedResult } of pointsToCheck) {
            expect(
                spatialHashmap.getNearby(queryPoint)
            ).toEqual(expectedResult);
        }
    });


    it('should throw if query point is totally outside bounds', () => {
        const rect = { x: -10, y: -10, width: 1, height: 1 };
        expect(() => spatialHashmap.getNearby(rect)).toThrow();
    });

    it('should throw if query point invalid', () => {
        const invalidQueryPoints = [
            null,
            undefined,
            true, 
            false,
            {},
            'cat',
            { x: 1 },
            { y: 1 },
            { width: 1 },
            { height: 1 },
            { x: 1, y: 1, width: 'dog', height: 1 },
        ];
        for (const invalidQueryPoint of invalidQueryPoints) {
            // @ts-ignore
            expect(() => spatialHashmap.getNearby(invalidQueryPoint)).toThrow();
        }
    });
});
