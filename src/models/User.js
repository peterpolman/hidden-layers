import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Utils from '../utils/Utils.js';

export default class User {
    constructor (
        id,
        color,
        position
    ) {
        this.id = id;
        this.color = color;
        this.coordinates = position;

        customLayer.world.loadObj({
            obj: './models/human/human.obj',
            mtl: './models/human/human.mtl'
        }, (human) => {
            this.mesh = human.setCoords([position.lng, position.lat]);
            this.mesh.scale.set(0.05,0.05,0.05);
            customLayer.world.add(this.mesh);
        });
    }

    load(model) {
        const loader = new THREE.Loader();
        return new Promise((resolve, reject) => {
            loader.load(model, (geometry) => {
                resolve(geometry);
            });
        });
    }

    setPosition(position) {
        this.mesh.setCoords([position.lng, position.lat]);
        this.mesh.updateMatrix();
    }

}
