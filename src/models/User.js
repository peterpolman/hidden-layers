import * as THREE from 'three';
import Utils from '../utils/Utils.js';

export default class User {
    constructor (
        id,
        color,
        position
    ) {
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshPhongMaterial({color: color});
        const worldProjection = new Utils().projectToWorld(position);

        this.id = id;
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(worldProjection.x,worldProjection.y,worldProjection.z);
        this.mesh.matrixAutoUpdate = true;
    }

    setPosition(position) {
        const worldProjection = new Utils().projectToWorld(position);

        this.mesh.position.set(worldProjection.x,worldProjection.y,worldProjection.z);
        this.mesh.updateMatrix();
    }

}
