const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

export default class BaseCharacter {
    constructor(id, data) {
        const HL = window.HL;
        this.id = id;
        this.tb = HL.tb;
        this.world = HL.tb.world;
        this.position = data.position;
        this.hashes = data.hashes;
        this.xpMarkup = '';

        this.loadAtPosition(id, (data.userClass ? data.userClass :  'scout'), data.position);
    }

    // Watch user properties for change and remove events
    watch() {
        console.log('Start watching!', this.id)
        this.ref.on('child_changed', (snap) => {
            switch(snap.key) {
                case 'position':
                    this.setPosition(snap.val());
                    // this.tb.repaint();
                    break
                case 'hashes':
                    this.hashes = snap.val();
                    break
                default:
                    console.error("No handler available", snap.key, snap.val());
            }
        });
        this.ref.on('child_removed', (snap) => {
            console.log("Property removed: ", snap.key, snap.val());
        });
    }

    loadAtPosition(id, obj, position) {
        return this.tb.loadObj({
            obj: `./models/${obj}/${obj}.obj`,
            mtl: `./models/${obj}/${obj}.mtl`
        }, (object) => {
            // Remove existing objects with same id
            const objectInScene = this.world.getObjectByName(id);
            this.tb.remove(objectInScene);

            // Add user specific data to be retreived later.
            object.userData = {
                id: id,
                position: position
            }

            object.scale.set(1.5,1.5,1.5);

            this.mesh = this.tb.Object3D({obj: object, units:'meters' }).setCoords([position.lng, position.lat]);
            this.mesh.name = id;

            this.tb.add(this.mesh);
            this.tb.repaint();

            this.watch();

            console.log('Object added to world: ', id, this.mesh)
        });
    }

    // Set the position of the objects in the world scene
    setPosition(position) {
        const HL = window.HL;
        const lngLat = [position.lng, position.lat];

        this.position = position;
        this.marker.setLngLat(lngLat)
        this.mesh.setCoords(lngLat);

        HL.updateFog();
    }

    getInfoMarkup() {
        let el = document.createElement('div');

        el.style = {position: 'relative'};
        el.classList.add(`marker-${this.id}`);
        el.innerHTML = `
            <div class="character-wrapper">
                ${this.xpMarkup}
                <div class="character-info">
                    <strong class="character-name">${this.name}</strong><br>
                    ${this.hitPointsMarkup}
                </div>
            </div>`;

        return el;
    }

    loadInfo(markup) {
        const MAP = window.MAP;

        if (this.marker === null) {
            this.marker = new mapboxgl.Marker({
                    element: markup,
                    offset: [30,40]
                })
                .setLngLat([this.position.lng, this.position.lat])
                .addTo(MAP);
        }
    }

    // Remove unit from scene and detach listener
    remove() {
        const objectInScene = this.world.getObjectByName(this.id);
        this.ref.off();
        this.marker.remove();
        this.world.remove(objectInScene);

        console.log(`Removed: ${this.id}`)
    }


    onClick() {
        alert(`This is ${this.name}`);
    }
}
