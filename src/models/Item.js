const Geohash = require('latlon-geohash');

import firebase from 'firebase/app';

export default class Item {
    constructor(id, data) {
        const HL = window.HL;

        this.tb = HL.tb;
        this.world = HL.tb.world;
        this.ref = firebase.database().ref('loot').child(id);

        this.id = id;
        this.slug = data.slug;
        this.name = data.name;
        this.amount = data.amount;
        this.position = data.position;

        this.mesh = null;

        this.loadAtPosition(id, data.slug, data.position);
    }

    // Watch user properties for change and remove events
    watch() {
        this.ref.on('child_changed', (snap) => {
            switch(snap.key) {
                case 'position':
                    this.setPosition(snap.val());
                    this.tb.repaint();
                    break
                default:
                    console.error("No handler available", snap.key, snap.val());
            }
        });

        console.log('Start watching!', this.id)
    }

    loadAtPosition(id, obj, position) {
        return this.tb.loadObj({
            obj: `./models/items/${obj}.obj`,
            mtl: `./models/items/${obj}.mtl`
        }, (object) => {
            // Remove existing objects with same id
            const objectInScene = this.world.getObjectByName(id);
            this.tb.remove(objectInScene);

            // Add user specific data to be retreived later.
            object.userData = {
                id: id,
                position: position
            }

            this.mesh = this.tb.Object3D({obj: object, units:'meters', scale: .5}).setCoords([position.lng, position.lat]);
            this.mesh.name = id;

            this.tb.add(this.mesh);
            this.tb.repaint();

            this.watch();

            console.log('Object added: ', id, this.mesh)
        });
    }

    onMapClickWhenSelected(e) {
        const HL = window.HL;
        const item = HL.selected
        const uid = firebase.auth().currentUser.uid;
        const hash = Geohash.encode(e.lngLat.lat, e.lngLat.lng, 7);

        // Set the item in the loot database
        this.ref.update({
            id: item.id,
            slug: item.slug,
            name: item.name,
            amount: item.amount,
            position: e.lngLat
        });

        firebase.database().ref('markers').child(hash).child(item.id).set({
            position: e.lngLat,
            ref: `loot/${item.id}`,
        });

        // Remove the item from the inventory of the owner
        firebase.database().ref('items').child(uid).child(item.slug).remove();

        HL.selected = null;
    }

    // Set the position of the objects in the world scene
    setPosition(lngLat) {
        this.position = {lng: lngLat[0], lat: lngLat[1]};
        this.mesh.setCoords(lngLat);

        this.tb.repaint();
    }

    // Remove user from scene and detach listener
    remove() {
        const objectInScene = this.world.getObjectByName(this.id);
        this.world.remove(objectInScene);
        this.ref.off();

        console.log(`Removed: ${this.id}`)
    }


    onClick() {
        const uid = firebase.auth().currentUser.uid;
        const hash = Geohash.encode(this.position.lat, this.position.lng, 7);

        // Pick up the item and place in inventory
        firebase.database().ref('items').child(uid).child(this.slug).set({
            id: this.id,
            slug: this.slug,
            name: this.name,
            amount: this.amount,
            position: this.position
        });

        // Remove from marker database
        firebase.database().ref('markers').child(hash).child(this.id).remove()

    }
}
