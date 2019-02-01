import Vue from 'vue';
import firebase from 'firebase/app';
import 'firebase/database';
import Item from '../models/Item'

export default class ItemController {
    constructor() {
        this.uid = firebase.auth().currentUser.uid
        this.inventory = {}
        this.inventoryOpen = false
        this.itemsRef = firebase.database().ref('items').child(this.uid)

        this.itemsRef.on('child_added', (snap) => {
            this.onItemAdded(snap.key, snap.val())
        })

        this.itemsRef.on('child_changed', (snap) => {
            this.onItemChanged(snap.key, snap.val())
        })

        this.itemsRef.on('child_removed', (snap) => {
            this.onItemRemoved(snap.key, snap.val())
        })

        window.addEventListener('item.add', (data) => {
            this.add(data.detail)
        })
    }

    onItemAdded(key, data) {
        Vue.delete(this.inventory, key)
        this.inventory[key] = data
    }

    onItemChanged(key, data) {
        Vue.delete(this.inventory, key)
        this.inventory[key] = data
    }

    onItemRemoved(key) {
        Vue.delete(this.inventory, key)
    }

    add(item) {
        if (this.inventory[item.slug]) {
            this.inventory[item.slug].amount += item.amount
        }
        else {
            this.inventory[item.slug] = item
        }

        this.itemsRef.child(item.slug).update(this.inventory[item.slug])
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
    //     // this.itemsRef.child(item.slug).update(this.inventory[item.slug])
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
            this.itemsRef.child(item.slug).remove()
        }
        else {
            this.itemsRef.child(item.slug).update(item)
        }
    }

}
