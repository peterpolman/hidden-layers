import firebase from 'firebase/app';
import DamagableCharacter from './DamagableCharacter';

export default class User extends DamagableCharacter {
    constructor (id, data) {
        super(id, data);

        this.ref = firebase.database().ref('users').child(id);
        this.slug = 'user';
        this.xp = data.experiencePoints;
        this.name = data.name;
        this.class = data.class;
        this.avatar = data.class;
        this.scout = data.scout;
        this.marker = null;

        this.setInfo();

        if (this.id === firebase.auth().currentUser.uid) {
            this.discover();
        }
    }

    getXpMarkup() {
        return `<div class="character-level">${this.xp}</div>`
    }

    discover() {
        const HL = window.HL;
        this.ref.child('hashes').on('child_added', (snap) => {
            HL.markerService.addHashListener(snap.key);
            console.log("Hash added: ", this.id, snap.val());
        });
        this.ref.child('hashes').on('child_removed', (snap) => {
            HL.markerService.removeHashListener(snap.key);
            console.log("Hash removed: ", this.id, snap.val());
        });
        console.log('Start watching hashes!', this.id)
    }

    die() {
        alert('You are lucky to be alive!');
        this.heal(100);
    }

    onClick() {
        console.log(`Hi ${this.name}!`);
    }
}
