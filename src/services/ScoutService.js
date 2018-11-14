import firebase from 'firebase';
import PathService from './PathService';
import Scout from '../models/Scout'

export default class ScoutService {
  constructor() {
    this.map = null
    this.pathService = new PathService

    this.scoutsRef = firebase.database().ref('scouts')
    this.scoutMarkers = []
  }

  listen(map) {
    this.map = map
    this.pathService.listen(this.map)

    this.scoutsRef.on('child_added', function(snap) {
      this.onChildAdded(snap.key, snap.val())
    }.bind(this));

    this.scoutsRef.on('child_changed', function(snap) {
      this.onChildChanged(snap.key, snap.val());
    }.bind(this));
  }

  onChildAdded(uid, data) {
    this.scoutMarkers[uid] = new Scout(uid, data.position, this.map, 30, "STANDING");

    console.log(`[ADD] SCOUT ${uid}`)
  }

  onChildChanged(uid, data) {
    this.scoutMarkers[uid].setPosition(data.position)
    this.scoutMarkers[uid].set('mode', data.mode)

    console.log(`[UPDATE] SCOUT position ${uid}`);
  }

  onChildRemoved(uid) {
    console.log(`[REMOVE] SCOUT ${uid}`);
  }

  send(uid, fromLatlng, toLatlng, travelMode) {
    const data = {
      'uid': uid,
      'position': fromLatlng
    }

    if (typeof this.scoutMarkers[uid] == 'undefined') {
      this.create(uid, data)
    }
    else {
      fromLatlng = this.scoutMarkers[uid].position
    }

    this.pathService.route(uid, fromLatlng, toLatlng, travelMode)
  }

  create(uid, data) {
    this.scoutsRef.child(uid).set(data)
  }

  update(uid, data) {
    this.scoutsRef.child(uid).update(data)
  }

}
