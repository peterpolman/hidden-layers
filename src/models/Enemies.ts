import { Character } from '@/models/Character';
import firebase from '@/firebase';

export class Goblin extends Character {
    ref: any;
    quaternion: any;

    constructor(id: string, data: any) {
        super(id, data);

        this.ref = firebase.db.ref(`npc/${data.id}`);
        this.quaternion = data.quaternion;
    }
}
