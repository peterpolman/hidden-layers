import firebase from 'firebase';

export default class UserManager {
  db: firebase.database(),
  constructor() {

  },
  create(uid, data) {
    console.log(this.db);
    debugger
    this.db.ref('users').child(uid).create(data);
  },
  update(uid, data) {
    this.uid = uid;
    this.db.ref('users').child(uid).update(data);
  },
  remove() {

  }
}
