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

        window.addEventListener('item.substract', (data) => {
            this.substract(data.detail)
        })

        window.addEventListener('item.add', (data) => {
            this.add(data.detail)
        })
    }

    onItemAdded(key, data) {
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

        this.update(this.inventory[item.slug])
    }

    substract(item) {
        if (item.slug == 'ward') {
            this.inventory[item.slug].amount--
        }
        else {
            this.inventory[item.slug].amount -= item.amount
        }

        if (this.inventory[item.slug].amount <= 0) {
            this.remove(item.slug)
        }
        else {
            this.update(this.inventory[item.slug])
        }
    }

    update(item) {
        this.itemsRef.child(item.slug).update(item)
    }

    remove(key) {
        this.itemsRef.child(key).remove()
    }

}
