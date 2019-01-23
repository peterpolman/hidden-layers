import firebase from 'firebase/app';
import 'firebase/database';

export default class ItemController {
  constructor(uid) {
    this.inventory = [null, null, null, null]
    this.inventoryOpen = false

    this.itemsRef = firebase.database().ref('items').child(uid)

    this.itemsRef.on('child_added', (snap) => {
			this.onItemAdded(snap.key, snap.val())
		})

		this.itemsRef.on('child_changed', (snap) => {
      this.onItemChanged(snap.key, snap.val())
		})

    this.itemsRef.on('child_removed', (snap) => {
      this.onItemRemoved(snap.key, snap.val())
		})

    window.addEventListener('item_substract', (data) => {
      const inventory = this.substract(data.detail)

      if (inventory) {
        this.update(inventory)
      }
    })

    window.addEventListener('item_add', (data) => {
      const inventory = this.add(data.detail)

      if (inventory) {
        this.update(inventory)
      }
    })
  }

  onItemAdded(key, data) {
    this.inventory[key] = data
    this.inventory.sort()
  }

  onItemChanged(key, data) {
    this.inventory[key] = data
    this.inventory.sort()
  }

  onItemRemoved(key) {
    this.inventory.splice(key, 1)
  }

  add(item) {
    var isInInventory = false
    var key

    for (key = 0; key < this.inventory.length; ++key) {
      if (this.inventory[key] && this.inventory[key].id === item.id) {
        isInInventory = true
        break
      }
    }

    if (isInInventory) {
      this.inventory[key].amount += item.amount
    }
    else {
      this.inventory.push(item)
    }

    return this.inventory
  }

  substract(item) {
    for (var key = 0; key < this.inventory.length; ++key) {
      if (this.inventory[key] && item.id === this.inventory[key].id) {
        this.inventory[key].amount -= item.amount

        if (this.inventory[key].amount <= 0) {
          this.inventory.splice(key, 1)
          window.dispatchEvent(new CustomEvent('cursor_changed', { detail: { type: null } }));
        }

        this.inventory.sort()
      }
    }

    return this.inventory
  }

  update(items) {
    this.itemsRef.set(items)
  }

  remove(key) {
    this.itemsRef.child(key).remove()
  }

}
