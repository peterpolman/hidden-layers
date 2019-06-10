const Geohash = require('latlon-geohash');
// import firebase from 'firebase/app';

export default class SpawnService {
    constructor() {
        // Start spawn timer and trigger method every 1 sec or so
        clearInterval(this.spawnTimer);
        this.spawnTimer = setInterval(this.onTimerUpdate, 1000);
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
                let hash = Geohash.encode(positions[i].lat, positions[i].lng, 7);
                var bounds = Geohash.bounds(hash);
                console.log(bounds);
                console.log('Spawn enemy near ', i)
                // Create an enemy
                var x_max = bounds.ne.lat;
                var x_min = bounds.sw.lat;
                var y_max = bounds.ne.lon;
                var y_min = bounds.sw.lon;

                var lat = y_min + (Math.random() * (y_max - y_min));
                var lng = x_min + (Math.random() * (x_max - x_min));

                console.log(lat, lng);
                // Push it in the enemy database

                // Push it in the marker geohash for the current uid
            }
        }
    }
}
