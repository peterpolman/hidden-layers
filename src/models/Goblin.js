import DamagableCharacter from './DamagableCharacter';

import firebase from 'firebase/app';
import Item from './Item';

export default class Goblin extends DamagableCharacter {
    constructor(id, data) {
        super(id, data);

        this.name = 'Goblin';
        this.race = 'goblin';
        this.class = 'goblin';
        this.level = data.level;
        this.ref = firebase.database().ref('npc').child(id);
        this.marker = null;
        this.defendTimer = null;
        this.greetings = [
            "I got what you need.",
            "Got the best deals anywheres.",
            "Can I lighten up that coin purse for ya?",
            "You break it, you buy it.",
            "I ain't got it, you don't want it.",
            "Cha-ching!",
            "Have I got a deal for you.",
            "This stuff sells itself.",
            "I know a buyer when I see one.",
            "I ain't getting paid to chat.",
            "Smart mouth, huh?",
            "Heheh, big shot huh?",
            "It's my way or the highway, pal!",
            "No loitering, whatever that means.",
            "I got no respect around here.",
            "You looking at me?",
            "Yo, can I help you with something?",
            "What's the word on the street?",
            "Yeah, yeah.",
            "I've seen you around here before?",
            "What's shaking?",
            "G.T.L, friend: Gambling, Tinkering, Laundry!",
            "Wazzup?",
            "Yeah, what ya want?",
            "Well, spit it out!",
            "Heeey, how ya doing?",
            "Yo!",
            "Don't waste my time!",
            "What!?",
            "Quickly, quickly!",
            "Go, go!",
            "Make sense!"
        ]
    }

    dropLoot(amount) {
        const gold = {
            id: firebase.database().ref('loot').push().key,
            slug: 'gold',
            name: 'Gold',
            amount: amount,
            position: this.position,
        }
        const item = new Item(gold.id, gold);
        item.drop(this.position);
    }

    fight() {
        const HL = window.HL;
        const damage = Math.floor(Math.random() * 10) + (this.level * 1);

        HL.user.hit(damage)
    }

    defend() {
        if (this.defendTimer === null) {
            this.defendTimer = window.setInterval(this.fight.bind(this), 1000)
        }
    }

    stopDefending() {
        window.clearInterval(this.defendTimer);
        this.defendTimer = null;
    }

    onClick() {
        const HL = window.HL;

        if (HL.selectedItem !== null) {
            this.use(HL.selectedItem);
            this.defend();
        }
        else {
            console.info(`Goblin: ${this.greetings[Math.floor(Math.random() * this.greetings.length)]}`);
        }
    }
}
