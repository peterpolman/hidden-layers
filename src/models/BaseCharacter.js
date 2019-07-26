const THREE = window.THREE;
const mapboxgl = window.mapboxgl;
import EventService from '../services/EventService';

export default class BaseCharacter {
    constructor(id, data) {
        const HL = window.HL;
        this.ea = new EventService(),
        this.id = id;
        this.tb = HL.tb;
        this.world = HL.tb.world;
        this.position = data.position;
        this.race = data.race;
        this.level = data.level;
        this.hashes = data.hashes;
        this.xpMarkup = '';
        this.mesh = null;

        this.loadAtPosition(id, ((data.race === 'human') ? data.class : data.race), data.position);
    }

    hide(visible) {
        this.mesh.visible = visible;

        if (this.stopDefending) this.stopDefending();

        if (this.marker != null) {
            if (visible) {
                // this.setInfo();
            }
            else {
                this.marker.remove();
            }
        }
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
                case 'experiencePoints':
                    this.setExperiencePoints(snap.val());
                    break;
                case 'level':
                    this.setLevel(snap.val());
                    break;
                case 'route':
                    if (snap.val().options) {
                        this.travelTo(snap.val());
                    }
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
        const loader = new THREE.GLTFLoader();
        const HL = window.HL;

        loader.load(`./objects/${obj}/${obj}.gltf`, (gltf) => {
            // Remove existing objects with same id
            const objectInScene = this.world.getObjectByName(id);
            this.tb.remove(objectInScene);

            gltf.scene.scale.set(1.5,1.5,1.5);
            gltf.scene.rotation.z = (180 * 0.0174533);
            gltf.scene.name = id;
            gltf.scene.userData = {
                id: id,
                position: position
            }

            if (gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(gltf.scene);

                this.walkCycleAction = this.mixer.clipAction(gltf.animations[0]);
                this.walkCycleAction.play();

                HL.mixers.push(this.mixer);
            }

            this.mesh = this.tb.Object3D({obj: gltf.scene, units:'meters' }).setCoords([position.lng, position.lat]);
            this.mesh.name = id;

            this.tb.add(this.mesh);
            this.tb.repaint();

            this.watch();

            console.log('Object added to world: ', id, this.mesh);
            console.log('Object is visible', id, this.mesh.visible);
        });
    }

    // Set the position of the objects in the world scene
    setPosition(position) {
        const HL = window.HL;
        const lngLat = [position.lng, position.lat];

        this.position = position;
        this.marker.setLngLat(lngLat)
        this.mesh.setCoords(lngLat);

        var positions = []
        positions[HL.user.id] = HL.user.position;
        positions[HL.scout.id] = HL.scout.position;

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
        this.tb.repaint();

        delete HL.markers[this.id];

        console.log(`Removed: ${this.id}`)
    }

    onClick() {

    }
}
