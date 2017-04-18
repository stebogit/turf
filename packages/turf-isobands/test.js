const test = require('tape');
const path = require('path');
const fs = require('fs');
const load = require('load-json-file');
const write = require('write-json-file');
const random = require('@turf/random');
const matrixToGrid = require('matrix-to-grid');
const truncate = require('@turf/truncate');
const isobands = require('./');


const directories = {
    in: path.join(__dirname, 'test', 'in') + path.sep,
    out: path.join(__dirname, 'test', 'out') + path.sep
};

const fixtures = fs.readdirSync(directories.in).map(filename => {
    return {
        filename,
        name: path.parse(filename).name,
        geojson: load.sync(directories.in + filename)
    };
});

test('isobands', t => {
    fixtures.forEach(({name, geojson, filename}) => {

        let {matrix, origin, cellSize, options} = geojson;
        const pointGrid = truncate(matrixToGrid(matrix, origin, cellSize, options));
        // const results = isobands(geojson, [0, 3, 5, 7, 10], 'elevation');
        const results = isobands(pointGrid, [0, 2, 5, 8, 11], 'elevation');

        if (process.env.REGEN) write.sync(directories.out + filename, results);
        t.equal(results.features[0].geometry.type, 'MultiPolygon', name + ' geometry=MultiPolygon');
        t.deepEqual(results, load.sync(directories.out + filename), name);
    });
    t.end();
});

test('isobands -- throws', t => {
    t.throws(() => isobands(random('polygon'), [1, 2, 3]), 'input polygon');
    t.end();
});
