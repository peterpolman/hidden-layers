import * as THREE from 'three';
const Constants = require("../utils/Constants.js");

export default class User {
    constructor (
        id,
        color,
        position
    ) {
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshPhongMaterial({color: color});
        const worldProjection = this.projectToWorld(position);

        this.id = id;
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(worldProjection.x,worldProjection.y,worldProjection.z);
        this.mesh.matrixAutoUpdate = true;
    }

    setPosition(position) {
        const worldProjection = this.projectToWorld(position);
        this.mesh.position.set(worldProjection.x,worldProjection.y,worldProjection.z);
        this.mesh.updateMatrix();
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
