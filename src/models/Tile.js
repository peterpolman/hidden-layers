const THREE = window.THREE;
const Geohash = require('latlon-geohash');

export default class Item {
    constructor(id, data) {
        const HL = window.HL;

        this.tb = HL.tb;
        this.world = HL.tb.world;

        this.position = data.position;
        this.mesh = null;

        if (data.position !== null) {
            const tile = this.getFeatureType(data.position);

            this.loadAtPosition(id, tile, data.position);
        }
    }

    hide(visible) {
        this.mesh.visible = visible;
    }

    getFeatureType(position) {
        const xy = MAP.project([position.lng, position.lat]);
        const features = MAP.queryRenderedFeatures(xy);

        return features[0]['layer'].id;
    }

    loadAtPosition(id, obj, position) {
        const loader = new THREE.GLTFLoader();
        const HL = window.HL;

        loader.load(`./objects/tile/${obj}.gltf`, (gltf) => {
            // Remove existing objects with same id
            const objectInScene = this.world.getObjectByName(id);
            this.tb.remove(objectInScene);

            gltf.scene.scale.set(12,12,12);
            gltf.scene.rotation.z = (180 * 0.0174533);
            gltf.scene.name = id;
            gltf.scene.userData = {
                id: id,
                position: position
            }
            
            this.mesh = this.tb.Object3D({obj: gltf.scene, units:'meters' }).setCoords([position.lng, position.lat]);
            this.mesh.name = id;

            this.tb.add(this.mesh);
            this.tb.repaint();

            console.log('Object added: ', id, this.mesh)
        });
    }

    // Set the position of the objects in the world scene
    setPosition(lngLat) {
        this.position = {lng: lngLat[0], lat: lngLat[1]};
        this.mesh.setCoords(lngLat);

        this.tb.repaint();
    }

    // Remove loot from scene and detach listener
    remove() {
        const objectInScene = this.world.getObjectByName(this.id);
        this.world.remove(objectInScene);
        this.tb.repaint();

        console.log(`Removed tile: ${this.id}`)
    }
}
