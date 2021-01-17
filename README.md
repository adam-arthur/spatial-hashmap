# Spatial Hashmap
An implementation of [spatial hashing](https://en.wikipedia.org/wiki/Collision_detection#Spatial_partitioning), which is typically used in collision detection. Objects are placed into "cells" within a 2D grid based on their position and size. Any object within the same cell is potentially colliding.


## Why is this useful?
For collision detection, it can be significantly faster to have both a coarse, "broad phase" to get potentially colliding objects first, and then a "narrow phase" where a precise collision check is used between any potentially colliding objects. Rather than always comparing every pair of objects.


## Install
`npm install @prolifica/spatial-hashmap`

## Usage

```javascript
import SpatialHashmap from '@prolifica/spatial-hashmap';

const map = new SpatialHashmap({ 
                width: 100, 
                height: 100, 
                cellSize: 10 
            });

const gameObject = {
    id: 'Player',
    body: {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
    },
};

// Second argument can be any rectangle definining position. In this case the player.body is a rectangle.
map.add(gameObject, gameObject.body);

// Get array of objects that could be intersecting this rectangle
map.getNearby({
    x: 5,
    y: 5,
    width: 1,
    height: 1,
});

// Used as a pre-filter to more precise collision detection
for (const group of map.getPossiblyCollidingGroups()) {
    checkForCollisions(group);
}
```

## API

### add(object, range)
Inserts an object into any cells of the grid that overlap range.

### getNearby(range)
Returns an array of any object that could potentially be touching the supplied range.

### getPossiblyCollidingGroups()
Returns all sets of objects that are possibly colliding


## Support
For any questions, support, or to follow my other projects, contact me at [adamarthur.io](https://adamarthur.io)!

