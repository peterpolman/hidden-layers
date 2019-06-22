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
            this.ea.dispatch('message.send', {
                type: 'info',
                content: "Entered the world!",
                uid: firebase.auth().currentUser.uid,
            });
        }
    }

    updateExperience(amount) {
        const HL = window.HL;
        const newXP = HL.user.xp + amount;
        const maxXP = this.level*100;

        // Check for level up and gain xp for killing
        if (newXP >= maxXP) {
            const diff = maxXP - newXP;
            const newLevel = this.level + 1;
            const percCurrentHP = this.hitPoints / (this.level * 100);
            const newHP = percCurrentHP * (newLevel * 100);

            HL.user.ref.child('hitPoints').set(newHP)
            HL.user.ref.child('level').set(newLevel)
            HL.user.ref.child('experiencePoints').set(diff)

            HL.user.setInfo();

            this.ea.dispatch('message.send', {
                type: 'success',
                content: `Gained a level. Congrats!`,
                uid: firebase.auth().currentUser.uid,
            });
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
        const hitPointsMax = (this.level * 100);
        this.heal(hitPointsMax);
        
        console.info(`${this.name} is lucky to be alive!`);
    }

    onClick() {
        if (this.id !== firebase.auth().currentUser.uid) {
            this.ea.dispatch('message.send', {
                type: 'warning',
                content: `Hi ${this.name}!`,
                uid: firebase.auth().currentUser.uid,
            });
        }
    }
}
