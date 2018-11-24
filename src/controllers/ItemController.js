import firebase from 'firebase'

export default class ItemController {
  constructor() {
    this.uid = firebase.auth().currentUser.uid
  }

}
