import firebase from 'firebase/app';
import DamagableCharacter from './DamagableCharacter';

export default class User extends DamagableCharacter {
    constructor (id, data) {
        super(id, data);

        this.ref = firebase.database().ref('users2').child(id);
        this.slug = 'user';
        this.xp = data.exp;
        this.name = data.username;
        this.class = data.userClass;
        this.avatar = data.userClass;
        this.stats = data.stats;
        this.scout = data.scout;
        this.marker = null;

        const xpMarkup = `<div class="character-level">
                ${this.xp}
            </div>`;

        this.xpMarkup = data.exp ? xpMarkup : '';

        this.loadInfo(this.getInfoMarkup());

        if (this.id === firebase.auth().currentUser.uid) {
            this.discover();
        }
    }

    discover() {
        console.log('Start watching hashes!', this.id)
        this.ref.child('hashes').on('child_added', (snap) => {
            HL.markerService.addListener(snap.key);
            console.log("Hash added: ", this.id, snap.val());
        });
        this.ref.child('hashes').on('child_removed', (snap) => {
            HL.markerService.removeListener(snap.key);
            console.log("Hash removed: ", this.id, snap.val());
        });
    }

    onClick() {
        alert(`Hi ${this.name}!`);
    }
}
