const THREE = window.THREE;
const Geohash = require('latlon-geohash');

import firebase from 'firebase/app';

export default class Item {
    constructor(id, data) {
        const HL = window.HL;
        const uid = firebase.auth().currentUser.uid;

        this.tb = HL.tb;
        this.world = HL.tb.world;

        this.lootRef = firebase.database().ref('loot').child(id);
        this.itemsRef = firebase.database().ref('items').child(uid);
        this.markersRef = firebase.database().ref('markers');

        this.id = id;
        this.name = data.name;
        this.amount = data.amount;
        this.position = data.position;
        this.slug = data.slug;

        this.mesh = null;

        if (data.position !== null) {
            this.loadAtPosition(id, data.slug, data.position);
        }
    }

    hide(visible) {
        this.mesh.visible = visible;
    }

    // Watch user properties for change and remove events
    watch() {
        this.lootRef.on('child_changed', (snap) => {
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
        const loader = new THREE.GLTFLoader();
        const HL = window.HL;

        // TEMP hack
        obj = (obj != 'sword' && obj != 'potion' && obj != 'gold') ? 'test' : obj;

        loader.load(`./objects/items/${obj}.gltf`, (gltf) => {
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

            console.log('Object added: ', id, this.mesh)
        });
    }

    drop(position) {
        const hash = Geohash.encode(position.lat, position.lng, 7);

        // Set the item in the loot database
        this.lootRef.update({
            id: this.id,
            slug: this.slug,
            name: this.name,
            amount: this.amount,
            position: position
        });

        this.markersRef.child(hash).child(this.id).set({
            position: position,
            ref: `loot/${this.id}`,
        });
    }

    removeFromInventory() {
        // Remove the item from the inventory of the owner
        this.itemsRef.child(this.slug).remove();
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

        this.lootRef.off();
        this.tb.repaint();

        console.log(`Removed: ${this.id}`)
    }

    pickup() {
        const hash = Geohash.encode(this.position.lat, this.position.lng, 7);

        this.itemsRef.child(this.slug).once('value').then((snap) => {
            // Increase the amount when there is a similar item there
            const item = snap.val()
            const amount = (item !== null && item.amount > 0)
                ? this.amount + snap.val().amount
                : this.amount;

            // Pick up the item and place in inventory
            this.itemsRef.child(this.slug).set({
                id: this.id,
                slug: this.slug,
                name: this.name,
                amount: amount,
                position: this.position
            });

            // Remove from marker database
            this.markersRef.child(hash).child(this.id).remove()
            // Remove from loot database
            this.lootRef.remove();
        })
    }
}
