import * as THREE from 'three';
const Constants = require('./Constants.js');

export default class Utils {
    constructor() {

    }

    projectedUnitsPerMeter(latitude) {
        return Math.abs( Constants.WORLD_SIZE / Math.cos( Constants.DEG2RAD * latitude ) / Constants.EARTH_CIRCUMFERENCE );
    }

    projectToWorld(coords) {
        // Spherical mercator forward projection, re-scaling to WORLD_SIZE
        var projected = [
            -Constants.MERCATOR_A * Constants.DEG2RAD* coords.lng * Constants.PROJECTION_WORLD_SIZE,
            -Constants.MERCATOR_A * Math.log(Math.tan((Math.PI*0.25) + (0.5 * Constants.DEG2RAD * coords.lat) )) * Constants.PROJECTION_WORLD_SIZE
        ];

        //z dimension, defaulting to 0 if not provided
        if (!coords[2]) projected.push(0)
        else {
            var pixelsPerMeter = this.projectedUnitsPerMeter(coords[1]);
            projected.push( coords[2] * pixelsPerMeter );
        }

        var result = new THREE.Vector3(projected[0], projected[1], projected[2]);

        return result;
    }
}
