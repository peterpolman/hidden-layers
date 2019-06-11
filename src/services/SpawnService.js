const Geohash = require('latlon-geohash');
import firebase from 'firebase/app';

export default class SpawnService {
    constructor() {
        // Start spawn timer and trigger method every 1 sec or so
        clearInterval(this.spawnTimer);
        this.spawnTimer = setInterval(this.onTimerUpdate.bind(this), 1000);
        this.markersRef = firebase.database().ref('markers');
        this.npcRef = firebase.database().ref('npc');
    }

    onTimerUpdate() {
        const HL = window.HL;
        let positions = [
            HL.user.position,
            HL.scout.position
        ]
        // Loop through the positions that have discovery
        for (let i in positions) {
            // Calculate the chance to spawn an enemy for all of them
            const p = Math.random(0,1);
            const pRate = .1;
            if (p < pRate) {
                const hash = Geohash.encode(positions[i].lat, positions[i].lng, 7);
                const bounds = Geohash.bounds(hash);
                const position = this.randomPosition(bounds);

                this.spawnNpc(hash, position, 'goblin')
            }
        }
    }

    randomPosition(bounds) {
        const x_max = bounds.ne.lat;
        const x_min = bounds.sw.lat;
        const y_max = bounds.ne.lon;
        const y_min = bounds.sw.lon;

        return {
            lat: x_min + (Math.random() * (x_max - x_min)),
            lng: y_min + (Math.random() * (y_max - y_min)),
        };
    }

    spawnNpc(hash, position, race) {
        // Check how many enemies for this Geohash
        // Set in markers database
        this.markersRef.child(hash).once('value').then(snap => {
            const markers = snap.val();
            let counter = 0;

            for (let id in markers) {
                if (markers[id].race === race) {
                    counter++
                }
            }

            // If less than 3 npcClass in geohash
            if (counter < 2) {
                const goblin = {
                    id: this.npcRef.push().key,
                    hitPoints: 100,
                    position: position,
                    userClass: race,
                    race: race,
                }

                // Set in npc database
                this.npcRef.child(goblin.id).set(goblin);
                this.markersRef.child(hash).child(goblin.id).set({
                    ref: `npc/${goblin.id}`,
                    race: race,
                    position: position
                });

                console.log(`A ${race} is added to the database`, goblin);
            }
        });
    }
}
