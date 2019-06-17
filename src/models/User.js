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
        this.level = data.level;

        this.setInfo();

        if (this.id === firebase.auth().currentUser.uid) {
            this.discover();
        }
    }

    updateExperience(amount) {
        const HL = window.HL;
        const newXP = HL.user.xp + amount;
        const maxXP = this.level*100;

        // Check for level up and gain xp for killing
        if (newXP >= maxXP) {
            const diff = maxXP - newXP;
            HL.user.ref.child('experiencePoints').set(diff)
            HL.user.ref.child('level').set(this.level + 1)

            HL.user.getXpMarkup();
            HL.user.setInfo();
        }
        else {
            HL.user.ref.child('experiencePoints').set(newXP)
        }

    }

    setLevel(level) {
        this.level = level;
    }

    setExperiencePoints(xp) {
        this.xp = xp;
    }

    getXpMarkup() {
        return `<div class="character-level">${this.level}</div>`
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
        alert(`${this.name} is lucky to be alive!`);
        this.heal(100);
    }

    onClick() {
        console.log(`Hi ${this.name}!`);
    }
}
