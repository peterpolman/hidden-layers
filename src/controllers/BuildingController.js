import firebase from 'firebase/app';
import 'firebase/database';

import Building from '../models/Building'

export default class BuildingController {
    constructor() {
        this.uid = firebase.auth().currentUser.uid
        this.construction = {
            house: {
                slug: 'house',
                name: 'House',
                size: 50,
            }
        }
        this.buildings = {}
        this.buildingsRef = firebase.database().ref('buildings')

        this.buildingsRef.on('child_added', (snap) => {
            this.onBuildingAdded(snap.key, snap.val())
        })

        this.buildingsRef.on('child_changed', (snap) => {
            this.onBuildingChanged(snap.key, snap.val())
        })

        this.buildingsRef.on('child_removed', (snap) => {
            this.onBuildingRemoved(snap.key, snap.val())
        })
    }

    onBuildingAdded(id, data) {
        this.buildings[id] = new Building(data)
        this.buildings[id].setMap(MAP)
        this.buildings[id].marker.addListener('click', (e) => {
            window.dispatchEvent(new CustomEvent('building.click', { detail: { id: id } }))
        })
    }

    onBuildingChanged(id, data) {
        if (data.hitPoints > 0) {
            this.buildings[id].setHitPoints(data.hitPoints)
        }
        else {
            this.remove(id)
        }
    }

    onBuildingRemoved(id) {
        this.buildings[id].setMap(null)
        delete this.buildings[id]
    }

    createMarkerId(latLng) {
        const id = (latLng.lat + "_" + latLng.lng)
        return id.replace(/\./g, '')
    }

    set(id, data) {
        data.timestamp = firebase.database.ServerValue.TIMESTAMP
        this.buildingsRef.child(id).set(data)
    }

    update(id, data) {
        this.buildingsRef.child(id).update(data)
    }

    remove(id) {
        this.buildingsRef.child(id).remove()
    }
}
