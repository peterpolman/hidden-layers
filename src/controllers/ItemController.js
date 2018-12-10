import firebase from 'firebase'

export default class ItemController {
  constructor(uid) {
    this.inventory = []

    this.itemsRef = firebase.database().ref('items').child(uid)

    this.itemsRef.on('child_added', function(snap) {
			this.onItemAdded(snap.key, snap.val())
		}.bind(this));

		this.itemsRef.on('child_changed', function(snap) {
      this.onItemChanged(snap.key, snap.val())
		}.bind(this));

    this.itemsRef.on('child_removed', function(snap) {
      this.onItemRemoved(snap.key, snap.val())
		}.bind(this));
  }

  onItemAdded(key, data) {
    this.inventory[key] = data
  }

  onItemChanged(key, data) {
    this.inventory = data
  }

  onItemRemoved(key) {
    this.inventory.splice(key, 1)
  }

  add(items) {
    this.itemsRef.set(items)
  }

  update(key, item) {
    this.itemsRef.child(key).update(item)
  }

  remove(key) {
    this.itemsRef.child(key).remove()
  }

}
