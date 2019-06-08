// import firebase from 'firebase/app';

export default class SpawnService {
    constructor() {
        // Start spawn timer and trigger method every 1 sec or so
        this.spawnTimer = setInterval(this.onTimerUpdate, 1000);
    }

    onTimerUpdate() {
        // Calc random int 0 - 1
        const rand = Math.rand(0,1);
        console.log(rand);
        // If randint is higher than .5 do stuff
        //
    }

}
