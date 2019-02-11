import Vue from 'vue';
import firebase from 'firebase/app';
import 'firebase/database';
import Item from '../models/Item'

export default class InventoryController {
    constructor() {
        this.uid = firebase.auth().currentUser.uid
        this.loaded = false
        this.inventory = {}

        this.inventoryRef = firebase.database().ref('items').child(this.uid)

        this.inventoryRef.once("value", (s) => {
            let count = 0

            this.inventoryRef.on('child_added', (snap) => {
                this.onInventoryAdded(snap.key, snap.val())

                if (s.numChildren() === ++count) {
                    this.loaded = true
                }
            })
        })

        this.inventoryRef.on('child_changed', (snap) => {
            this.onInventoryChanged(snap.key, snap.val())
        })

        this.inventoryRef.on('child_removed', (snap) => {
            this.onInventoryRemoved(snap.key, snap.val())
        })

        window.addEventListener('item.add', (data) => {
            this.add(data.detail)
        })
    }

    onInventoryAdded(key, data) {
        Vue.delete(this.inventory, key)
        this.inventory[key] = data
    }

    onInventoryChanged(key, data) {
        Vue.delete(this.inventory, key)
        this.inventory[key] = data
    }

    onInventoryRemoved(key) {
        Vue.delete(this.inventory, key)
    }

    add(item) {
        if (this.inventory[item.slug]) {
            this.inventory[item.slug].amount += item.amount
        }
        else {
            this.inventory[item.slug] = item
        }

        this.inventoryRef.child(item.slug).update(this.inventory[item.slug])
    }

    // give(uid, item, amount) {
    //     const targetItemsRef = firebase.database().ref('items').child(uid)
    //
    //     console.log(targetItemsRef)
    //
    //     targetItemsRef.on('value', (snap) => {
    //         console.log(snap.key, snap.val())
    //     })
    //
    //     // if (this.inventory[item.slug]) {
    //     //     this.inventory[item.slug].amount += item.amount
    //     // }
    //     // else {
    //     //     this.inventory[item.slug] = item
    //     // }
    //     //
    //     // this.inventoryRef.child(item.slug).update(this.inventory[item.slug])
    // }

    substractAll(item) {
        item.amount -= item.amount

        this.update(item)
    }

    substract(item, amount) {
        item.amount = item.amount - amount

        this.update(item)
    }

    update(item) {
        if (this.inventory[item.slug].amount <= 0) {
            this.inventoryRef.child(item.slug).remove()
        }
        else {
            this.inventoryRef.child(item.slug).update(item)
        }
    }

}
