import firebase from 'firebase/app';

export default class BaseCharacter {
    constructor(id, data) {
        const HL = window.HL;
        this.id = id;
        this.tb = HL.tb;
        this.world = HL.tb.world;
        this.ref = firebase.database().ref((data.email != null) ? 'users2' : 'scouts2').child(id);
        this.position = data.position;

        this.loadAtPosition(id, (data.userClass ? data.userClass : 'scout'), data.position);
    }

    // Watch user properties for change and remove events
    watch() {
        console.log('Start watching!', this.id)
        this.ref.on('child_changed', (snap) => {
            // console.log("Property changed: ", this.id, snap.val());
            switch(snap.key) {
                case 'position':
                    this.setPosition(snap.val());
                    this.tb.repaint();
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

            this.mesh = this.tb.Object3D({obj:object, units:'meters' }).setCoords([position.lng, position.lat]);
            this.mesh.name = id;

            this.tb.add(this.mesh);
            this.tb.repaint();
            this.watch();

            console.log('Object added: ', id, this.mesh)
        });
    }

    // Set the position of the objects in the world scene
    setPosition(position) {
        const HL = window.HL;
        const lngLat = [position.lng, position.lat];
        const uid = firebase.auth().currentUser.uid;

        this.position = position;
        this.marker.setLngLat(lngLat)
        this.mesh.setCoords(lngLat);

        HL.discover(uid);
        this.tb.repaint();
    }

    // Remove user from scene and detach listener
    remove() {
        const objectInScene = this.world.getObjectByName(this.id);
        this.world.remove(objectInScene);
        this.marker.remove();
        this.ref.off();

        console.log(`Removed: ${this.id}`)
    }


    onClick() {
        alert(`This is ${this.name}`);
    }
}