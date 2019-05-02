import firebase from 'firebase/app'
import 'firebase/database'

import Goblin from '../models/Goblin'

export default class StoreController {
    constructor() {
        this.uid = firebase.auth().currentUser.uid
        this.goblins = {}
        this.enemiesRef = firebase.database().ref('enemies')
        this.enemiesRef.on('child_added', (snap) => {
            this.onEnemyAdded(snap.key, snap.val())
        })
    }

    onEnemyAdded(id, data) {
        this.goblins[id] = new Goblin(data.position, 40)
        this.goblins[id].marker.addListener('click', () => {
            window.dispatchEvent(new CustomEvent('character.click', { detail: { id: id, target: 'goblin' } }))
        })
        this.goblins[id].setMap(MAP)
        this.goblins[id].setVisible(false)
    }
}
