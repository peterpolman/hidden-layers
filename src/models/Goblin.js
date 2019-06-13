import DamagableCharacter from './DamagableCharacter';

import firebase from 'firebase/app';

export default class Goblin extends DamagableCharacter {
    constructor(id, data) {
        super(id, data);

        this.name = 'Goblin';
        this.race = 'goblin';
        this.class = 'goblin';
        this.ref = firebase.database().ref('npc').child(id);
        this.marker = null;
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

    onClick() {
        const HL = window.HL;
        const message = `Goblin: ${this.greetings[Math.floor(Math.random() * this.greetings.length)]}`;

        this.use(HL.selected);

        console.log(message)
    }
}
