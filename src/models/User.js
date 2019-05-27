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
            // obj: './models/robot/robot.obj',
            obj: './models/human/human.obj',
            mtl: './models/human/human.mtl'
        }, (human) => {
            // Remove existing objects with same id
            const objectInScene = this.world.getObjectByName(id);
            this.tb.remove(objectInScene);

            // Add user specific data to be retreived later.
            human.name = id;
            human.userData = {
                id: id,
                position: position
            }


            const mesh = this.tb.Object3D({obj:human, units:'meters', scale: 0.05 }).setCoords([position.lng, position.lat]);
            mesh.material = new THREE.MeshLambertMaterial({color: 0xff0000, transparent: true, opacity: 0.5});

            var material = new THREE.MeshStandardMaterial({metalness: 0, roughness: 0.5});

            this.tb.add(mesh);
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
