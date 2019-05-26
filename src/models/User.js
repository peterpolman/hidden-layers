import firebase from 'firebase/app';
import 'firebase/database';

export default class User {
    constructor (
        id,
        position
    ) {
        const HL = window.HL;

        this.id = id;
        this.position = position;
        this.tb = HL.tb;
        this.world = HL.tb.world;
        this.ref = firebase.database().ref(`users2/${id}`);
        this.loadAtPosition(id, position);
        this.watch();
    }

    loadAtPosition(id, position) {
        return this.tb.loadObj({
            obj: './models/human/human.obj',
            mtl: './models/human/human.mtl'
        }, (human) => {
            this.mesh = human.setCoords([position.lng, position.lat]);
            this.mesh.scale.set(0.05,0.05,0.05);
            this.mesh.name = id;

            const objectInScene = this.world.getObjectByName(id);
            this.world.remove(objectInScene);
            this.world.add(this.mesh);
        });
    }

    // Watch user properties for change and remove events
    watch() {
        console.log('Start watching!', this.id)
        this.ref.on('child_changed', (snap) => {
            console.log("Property changed: ", this.id, snap.val());

            switch(snap.key) {
                case 'position':
                    this.setPosition(snap.val());
                break
                default:
                    console.error("No handler available", snap.key, snap.val());
            }
        });
        this.ref.on('child_removed', (snap) => {
            console.log("Property removed: ", snap.key, snap.val());
        });
    }

    // Set the position of the objects in the world scene
    setPosition(position) {
        this.position = position;
        this.mesh.setCoords([position.lng, position.lat]);
        this.mesh.updateMatrix();
    }

    // Remove user from scene and detach listener
    remove() {
        const objectInScene = this.world.getObjectByName(this.id);
        this.world.remove(objectInScene);

        this.ref.off();

        console.log(`Removed: ${this.id}`)
    }
}
