import Vue from 'vue';
import firebase from 'firebase/app';
import 'firebase/database';
import Item from '../models/Item'

export default class EquipmentController {
    constructor() {
        this.uid = firebase.auth().currentUser.uid
        this.loaded = false
        this.equipment = {
            head: {
                slug: 'HEAD',
                item: null
            },
            bag: {
                slug: 'BAG',
                item: {
                    name: 'Backpack',
                    slug: 'inventory',
                    amount: 1,
                    description: "Can hold up to an x amount of slots for items found in the world."
                }
            },
            mainHand: {
                slug: 'HAND',
                item: null
            },
            body: {
                slug: 'BODY',
                item: null
            },
            offHand: {
                slug: 'HAND',
                item: null
            },
            feet: {
                slug: 'FEET',
                item: null
            },
        }

        this.equipmentRef = firebase.database().ref('equipment').child(this.uid)

        this.equipmentRef.once('value', (s) => {
            let count = 0

            this.equipmentRef.on('child_added', (snap) => {
                this.onEquipmentAdded(snap.key, snap.val())

                if (s.numChildren() === ++count) {
                    this.loaded = true
                }
            })
        })

        this.equipmentRef.on('child_changed', (snap) => {
            this.onEquipmentChanged(snap.key, snap.val())
        })

        this.equipmentRef.on('child_removed', (snap) => {
            this.onEquipmentRemoved(snap.key, snap.val())
        })
    }

    onEquipmentAdded(key, data) {
        Vue.delete(this.equipment, key)
        this.equipment[key] = data
    }

    onEquipmentChanged(key, data) {
        Vue.delete(this.equipment, key)
        this.equipment[key] = data
    }

    onEquipmentRemoved(key) {
        Vue.delete(this.equipment, key)
    }

}
