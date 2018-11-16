import firebase from 'firebase';
import PathService from './PathService';
import Scout from '../models/Scout'

export default class ScoutService {
  constructor() {
    this.map = null
    this.pathService = new PathService

    this.scoutsRef = firebase.database().ref('scouts')
    this.scoutMarkers = []
    this.userMarkers = []

    this.infoWindow = null
  }

  listen(map) {
    this.map = map
    this.pathService.listen(this.map)
    this.infoWindow = new google.maps.InfoWindow({
      isHidden: false
    });

    this.scoutsRef.on('child_added', function(snap) {
      this.onChildAdded(snap.key, snap.val())
    }.bind(this));

    this.scoutsRef.on('child_changed', function(snap) {
      this.onChildChanged(snap.key, snap.val());
    }.bind(this));
  }

  onChildAdded(uid, data) {
    this.scoutMarkers[uid] = new Scout(uid, data.position, this.map, 30, data.mode);
    this.scoutMarkers[uid].addListener('click', function(e) {
      const username = this.userMarkers[data.uid].username
      const content = `<strong>Scout [${username}]</strong><br><small>Last move: ${new Date(data.timestamp).toLocaleString("nl-NL")}</small>`

      this.infoWindow.setContent(content);
      this.infoWindow.open(this.map, this.scoutMarkers[uid]);

      this.map.panTo(e.latLng)
    }.bind(this))

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
      'position': {
        'lat': fromLatlng.lat(),
        'lng': fromLatlng.lng()
      }
    }

    // If the user has no scout spawn a new one
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
