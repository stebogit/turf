const write = require('write-json-file');
const load = require('load-json-file');
const fs = require('fs');
const path = require('path');
const test = require('tape');
const distance = require('@turf/distance');
const destination = require('./');

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

const round = (num, decimals) => {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
}

test('turf-destination', t => {
    for (const {filename, name, geojson}  of fixtures) {
        const dist = 100;
        const bear = (geojson.properties.bear !== undefined)
            ? geojson.properties.bear
            : 180;
        const results = destination(geojson, dist, bear, 'kilometers');

        const d = distance(geojson, results);

        if (process.env.REGEN) write.sync(directories.out + filename, results);
        t.deepEqual(results, load.sync(directories.out + filename), name);
        t.equals(dist, round(d, 6), 'distance');
    }
    t.end();
});

