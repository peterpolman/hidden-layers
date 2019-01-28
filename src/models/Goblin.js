import firebase from 'firebase/app'
import Character from './Character.js'

export default class Goblin extends Character {
    constructor(position, size) {
        super(position, 100)
        const iconSize = 40

        this.hasTalked = false
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

        this.marker = new google.maps.Marker({
            position: new google.maps.LatLng(position.lat, position.lng),
            label: null,
            icon: {
                labelOrigin: new google.maps.Point(iconSize / 2, -10),
                url: require('../assets/img/goblin-1.png'),
                size: new google.maps.Size(iconSize, iconSize),
                scaledSize: new google.maps.Size(iconSize, iconSize),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(iconSize / 2, (iconSize / 2) - 5)
            }
        })

    }

    talk() {
        const message = `Goblin: ${this.greetings[Math.floor(Math.random() * this.greetings.length)]}`
        window.dispatchEvent(new CustomEvent('message_add', {
            detail: {
                message: message,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            }
        }))

        this.hasTalked = true

        return `Goblin: ${message}`
    }

	// update(data) {
	// 	return this.scoutRef.update(data);
	// }

}
