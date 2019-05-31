import firebase from 'firebase/app';
import Character from './Character';

export default class User extends Character {
    constructor (id, data) {
        super(id, data);

        this.type = 'human';
        this.exp = data.exp;
        this.userName = data.username;
        this.userClass = data.userClass;
        this.stats = data.stats;
        this.position = data.position;

        this.ref = firebase.database().ref(`users2/${id}`);
        this.loadAtPosition(id, this.type, data.position);
        this.watch();
    }

    onClick(uid) {
        alert(uid);
    }
}
