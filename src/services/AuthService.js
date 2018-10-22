import firebase from 'firebase';

export default class ConnectionManager {
  constructor(db) {
    this.db = firebase.database();
  }
}
