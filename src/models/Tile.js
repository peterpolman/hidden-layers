const THREE = window.THREE;
const Geohash = require('latlon-geohash');

export default class Item {
    constructor(id, mesh, data) {
        const HL = window.HL;

        this.tb = HL.tb;
        this.world = HL.tb.world;

        this.position = data.position;

        this.mesh = mesh.duplicate();

        if (data.position !== null) {
            this.loadAtPosition(id, mesh, data.position);
        }
    }

    hide(visible) {
        this.mesh.visible = visible;
    }

    loadAtPosition(id, mesh, position) {
        const HL = window.HL;
        const objectInScene = this.world.getObjectByName(id);

        this.tb.remove(objectInScene);

        this.mesh.setCoords([position.lng, position.lat]);
        this.mesh.name = id;

        this.tb.add(this.mesh);
        this.tb.repaint();
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
