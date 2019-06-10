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
        for (let id in positions) {
            // Calculate the chance to spawn an enemy for all of them
            const p = Math.random(0,1);
            const pRate = .1;
            if (p < pRate) {
                console.log('Spawn at', id)
                // Create an enemy

                // Push it in the enemy database

                // Push it in the marker geohash for the current uid
            }
        }
    }
}
