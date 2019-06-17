const mapboxgl = window.mapboxgl;

export default class BaseCharacter {
    constructor(id, data) {
        const HL = window.HL;
        this.id = id;
        this.tb = HL.tb;
        this.world = HL.tb.world;
        this.position = data.position;
        this.hashes = data.hashes;
        this.xpMarkup = '';

        this.loadAtPosition(id, ((data.race === 'human') ? data.class : data.race), data.position);
    }

    // Watch user properties for change and remove events
    watch() {
        console.log('Start watching!', this.id)
        this.ref.on('child_changed', (snap) => {
            switch(snap.key) {
                case 'position':
                    this.setPosition(snap.val());
                    break
                case 'hashes':
                    this.hashes = snap.val();
                    break
                case 'hitPoints':
                    this.setHitPoints(snap.val());
                    break;
                default:
                    console.error("No handler available", snap.key, snap.val());
            }
        });
        this.ref.on('child_removed', (snap) => {
            console.log("Property removed: ", snap.key, snap.val());
        });
    }

    loadAtPosition(id, obj, position) {
        this.tb.loadObj({
            obj: `./objects/${obj}/${obj}.obj`,
            mtl: `./objects/${obj}/${obj}.mtl`
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
        const lngLat = [position.lng, position.lat];
        const HL = window.HL;

        this.position = position;
        this.marker.setLngLat(lngLat)
        this.mesh.setCoords(lngLat);

        var positions = []
        positions[HL.user.id] = HL.user.position;
        positions[this.id] = this.position;

        HL.fog.updateFog(positions);
    }

    setInfo(hit = null, isDamage = null) {
        const MAP = window.MAP;
        let el = document.createElement('div');

        el.style = {position: 'relative'};
        el.classList.add(`marker-${this.id}`);
        el.id = `marker-${this.id}`;
        el.innerHTML = `
            <div class="character-wrapper">
                ${(this.xp != null) ? this.getXpMarkup() : ''}
                <div class="character-info">
                    <strong class="character-name">${this.name}</strong><br>
                    ${this.getHitPointsMarkup()}
                </div>
            </div>`;

        if (this.marker !== null) {
            this.marker.remove();
            this.marker = null;
        }

        this.marker = new mapboxgl.Marker({
                element: el,
                offset: [30,40],
            })
            .setLngLat([this.position.lng, this.position.lat])
            .addTo(MAP);

        if (hit !== null) {
            var marker = document.getElementById(`marker-${this.id}`);
            var markup = document.createElement('div');
            markup.classList.add('character-hit');
            markup.classList.add(isDamage ? 'dmg' : 'heal');
            markup.innerHTML = hit;

            marker.appendChild(markup)

            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                if (this.hitPoints > 0) this.setInfo()
            }, 500)
        }
    }

    // Remove unit from scene and detach listener
    remove() {
        const HL = window.HL;
        const objectInScene = this.world.getObjectByName(this.id);

        if (this.marker != null) {
            this.marker.remove();
            this.marker = null;
        }

        this.ref.off();
        this.world.remove(objectInScene);
        HL.tb.repaint();

        delete HL.markers[this.id];

        console.log(`Removed: ${this.id}`)
    }


    onClick() {

    }
}
