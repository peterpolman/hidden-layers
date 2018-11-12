import firebase from 'firebase';

import PathService from './PathService';

import maleSrc from '../assets/img/user-male.png';
import femaleSrc from '../assets/img/user-female.png';
import walkerSrc from '../assets/img/user-me.png';

export default class MarkerService {
  constructor() {
    this.map = null
    this.pathService = new PathService

    this.walkersRef = firebase.database().ref('walkers')
    this.walkerMarkers = []
    this.selectedWalker = null

    this.userMarkers = []

    this.avatars = {
      male: maleSrc,
      female: femaleSrc,
      walker: walkerSrc,
    }

  }

  listen(map) {
    this.map = map
    this.pathService.listen(this.map)

    this.walkersRef.on('child_added', function(snap) {
      this.onChildAdded(snap.key, snap.val())
    }.bind(this));

    this.walkersRef.on('child_changed', function(snap) {
      this.onChildChanged(snap.key, snap.val());
    }.bind(this));

    this.walkersRef.on('child_removed', function(snap) {
      this.onChildRemoved(snap.key);
    }.bind(this));

    this.pathService.pathsRef.on('child_removed', function(snap) {
      this.onPathRemoved(snap.key, snap.val());
    }.bind(this));
  }

  onPathRemoved(uid, data) {
    var amountOfPoints = data.path.length
    var update = {
      'position': data.path[ amountOfPoints - 1 ]
    }

    this.updateWalker(uid, update)
  }

  onChildAdded(uid, data) {
    const walker = new google.maps.Marker({
      uid: uid,
      position: data.position,
      map: this.map,
      icon: {
        url: this.avatars.walker,
        size: new google.maps.Size(20, 20),
        scaledSize: new google.maps.Size(20, 20),
        origin: new google.maps.Point(0,0),
      }
    });

    this.walkerMarkers[uid] = walker;

    console.log(`Walker added`)
  }

  onChildChanged(uid, data) {
    this.walkerMarkers[uid].setPosition(data.position)

    console.log(`Walker changed`);
  }

  onChildRemoved(uid) {
    console.log(`Walker removed`);
  }

  sendWalker(uid, fromLatlng, toLatlng, travelMode) {
    const data = {
      'uid': uid,
      'position': fromLatlng
    }

    if (typeof this.walkerMarkers[uid] == 'undefined') {
      this.createWalker(uid, data)
    }
    else {
      fromLatlng = this.walkerMarkers[uid].position
    }

    this.pathService.createRoute(uid, fromLatlng, toLatlng, travelMode)
  }

  createWalker(uid, data) {
    this.walkersRef.child(uid).set(data)
  }

  updateWalker(uid, data) {
    this.walkersRef.child(uid).update(data)
  }

  createUserMarker(uid, data, me) {
    const userMarker = new google.maps.Marker({
      uid: uid,
      position: (data.position != null) ? new google.maps.LatLng(data.position.lat, data.position.lng) : null,
      icon: {
        url: this.avatars[data.gender],
        size: new google.maps.Size(40, 40),
        scaledSize: new google.maps.Size(40, 40),
        origin: new google.maps.Point(0,0),
      },
      animation: (me === true) ? google.maps.Animation.DROP : null
    });

    return this.userMarkers[uid] = userMarker;
  }

  updateUserMarker(uid, data) {
    this.userMarkers[uid]

    return this.userMarkers[uid]
  }

}
