import firebase from 'firebase';

import PathService from '../services/PathService';

import Scout from '../models/Scout';
import User from '../models/User';

export default class ScoutService {
  constructor() {
    this.uid = firebase.auth().currentUser.uid
    this.map = null

    this.pathService = new PathService

    this.connectedRef = firebase.database().ref('.info/connected')

    this.myUserRef = firebase.database().ref('users').child(this.uid)
    this.myScoutRef = firebase.database().ref('scouts').child(this.uid)
    this.usersRef = firebase.database().ref('users')
    this.scoutsRef = firebase.database().ref('scouts')

    this.myUserMarker = []
    this.myScoutMarker = []
    this.userMarkers = []
    this.scoutMarkers = []

    this.userInfoWindow = null
    this.scoutInfoWindow = null

    this.isWalking = false
  }

  listen(map) {
    this.map = map
    this.pathService.listen(this.map)
    this.userInfoWindow = new google.maps.InfoWindow({
      isHidden: false
    });
    this.scoutInfoWindow = new google.maps.InfoWindow({
      isHidden: false
    });

    const userConnectionsRef = this.usersRef.child(this.uid).child('connections');
    const lastOnlineRef = this.usersRef.child(this.uid).child('lastOnline');

    this.connectedRef.on('value', function(snap) {
      if (snap.val() === true)  {
        const connection = userConnectionsRef.push();

        connection.onDisconnect().remove();
        connection.set(true);
        lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
      }
    });

    this.usersRef.on('child_added', function(snap) {
      console.log(`[ADD] User ${snap.key}`);
      if (snap.key != this.uid) {
        this.onUserAdded(snap.key, snap.val())
      }
      else {
        this.onMyUserAdded(snap.key, snap.val())
      }
    }.bind(this));

    this.usersRef.on('child_changed', function(snap) {
      console.log(`[CHANGE] User ${snap.key}`);
      if (snap.key != this.uid) {
        this.onUserChanged(snap.key, snap.val())
      }
      else {
        this.onMyUserChanged(snap.key, snap.val())
      }

      const visibility = this.setGrid()
      this.discover(visibility)
    }.bind(this));

    this.scoutsRef.on('child_added', function(snap) {
      console.log(`[ADD] Scout ${snap.key}`);
      if (snap.key != this.uid) {
        this.onScoutAdded(snap.key, snap.val())
      }
      else {
        this.onMyScoutAdded(snap.key, snap.val())
      }
    }.bind(this));

    this.scoutsRef.on('child_changed', function(snap) {
      console.log(`[CHANGE] User ${snap.key}`);
      if (snap.key != this.uid) {
        this.onScoutChanged(snap.key, snap.val());
      }
      else {
        this.onMyScoutChanged(snap.key, snap.val());
      }

      const visibility = this.setGrid()
      this.discover(visibility)
    }.bind(this));

  }

  discover(visibility) {
    for (let uid in this.userMarkers) {
      var isVisible = google.maps.geometry.poly.containsLocation(this.userMarkers[uid].position, visibility)
      this.userMarkers[uid].setVisible(isVisible)
    }
    for (let uid in this.scoutMarkers) {
      var isVisible = google.maps.geometry.poly.containsLocation(this.scoutMarkers[uid].position, visibility)
      this.scoutMarkers[uid].setVisible(isVisible)
    }
  }

  onMyUserAdded(uid, data) {
    this.myUserMarker = new User(uid, data.position, data.gender, data.username, data.email, 50, true);
    this.myUserMarker.addListener('click', function(e){
      const content = `<strong>${data.username}</strong><br><small>Last online: ${new Date(data.lastOnline).toLocaleString("nl-NL")}</small>`

      this.userInfoWindow.setContent(content);
      this.userInfoWindow.open(this.map, this.myUserMarker);

      this.map.panTo(e.latLng)
    }.bind(this))

    this.myUserMarker.setMap(this.map);
  }

  onMyUserChanged(uid, data) {
    const latlng = new google.maps.LatLng(data.position.lat, data.position.lng)
    this.myUserMarker.setPosition(latlng)
  }

  onMyScoutAdded(uid, data) {
    this.myScoutMarker = new Scout(uid, data.position, 40, data.mode);
    this.myScoutMarker.addListener('click', function(e) {
      const username = this.myUserMarker.username
      const content = `<strong>Scout [${username}]</strong><br><small>Last move: ${new Date(data.timestamp).toLocaleString("nl-NL")}</small>`

      this.scoutInfoWindow.setContent(content);
      this.scoutInfoWindow.open(this.map, this.myScoutMarker);

      this.map.panTo(e.latLng)
    }.bind(this))

    this.myScoutMarker.setMap(this.map);

    this.isWalking = (this.myScoutMarker.mode == "WALKING")
  }

  onMyScoutChanged(uid, data) {
    this.myScoutMarker.setPosition(data.position)
    this.myScoutMarker.set('mode', data.mode)
    this.isWalking = (this.myScoutMarker.mode == "WALKING")
  }

  onUserAdded(uid, data) {
    this.userMarkers[uid] = new User(uid, data.position, data.gender, data.username, data.email, 50, false);
    this.userMarkers[uid].addListener('click', function(e){
      const content = `<strong>${data.username}</strong><br><small>Last online: ${new Date(data.lastOnline).toLocaleString("nl-NL")}</small>`

      this.userInfoWindow.setContent(content);
      this.userInfoWindow.open(this.map, this.userMarkers[uid]);

      this.map.panTo(e.latLng)
    }.bind(this))

    this.userMarkers[uid].setMap(this.map);
    this.userMarkers[uid].setVisible(false);
  }

  onUserChanged(uid, data) {
    const latlng = new google.maps.LatLng(data.position.lat, data.position.lng)
    this.userMarkers[uid].setPosition(latlng)
  }

  onUserRemoved(uid) {
    this.userMarkers[uid].setMap(null)
    this.userMarkers.splice(uid, 1)
  }

  createUser(uid, data) {
    this.usersRef.child(uid).set(data)
  }

  updateUser(uid, data) {
    this.usersRef.child(uid).update(data);
  }

  removeUser(uid) {
    this.usersRef.child(uid).remove();
  }

  onScoutAdded(uid, data) {
    this.scoutMarkers[uid] = new Scout(uid, data.position, 40, data.mode);
    this.scoutMarkers[uid].addListener('click', function(e) {
      const username = this.userMarkers[uid].username
      const content = `<strong>Scout [${username}]</strong><br><small>Last move: ${new Date(data.timestamp).toLocaleString("nl-NL")}</small>`

      this.scoutInfoWindow.setContent(content);
      this.scoutInfoWindow.open(this.map, this.scoutMarkers[uid]);

      this.map.panTo(e.latLng)
    }.bind(this))

    this.scoutMarkers[uid].setMap(this.map);
    this.scoutMarkers[uid].setVisible(false)
  }

  onScoutChanged(uid, data) {
    this.scoutMarkers[uid].setPosition(data.position)
    this.scoutMarkers[uid].set('mode', data.mode)

    const isVisible = google.maps.geometry.poly.containsLocation(data.position, this.visibility)

    if (isVisible) {
      this.scoutMarkers[uid].setVisible(true)
    }
  }

  // onScoutRemoved(uid) {
  //   console.log(`[REMOVE] SCOUT ${uid}`);
  // }

  send(uid, fromLatlng, toLatlng, travelMode) {
    const data = {
      'uid': uid,
      'position': {
        'lat': fromLatlng.lat(),
        'lng': fromLatlng.lng()
      }
    }

    // If the user has no scout spawn a new one
    if (this.myScoutMarker.length > 0) {
      this.createScout(uid, data)
    }
    else {
      fromLatlng = this.myScoutMarker.position
    }

    this.pathService.route(uid, fromLatlng, toLatlng, travelMode)
  }

  createScout(uid, data) {
    this.scoutsRef.child(uid).set(data)
  }

  // updateScout(uid, data) {
  //   this.scoutsRef.child(uid).update(data)
  // }

  // removeScout(uid, data) {
  //   this.scoutsRef.child(uid).remove()
  // }

  circlePath(center, radius, points) {
    var a = [], p = 360 / points, d = 0;

    for (var i = 0; i < points; ++i, d+= p) {
      a.push(google.maps.geometry.spherical.computeOffset(center, radius, d));
    }

    return a
  }

  setGrid() {
    const userPositionPath = this.circlePath(this.myUserMarker.position, 200, 32)
    const scoutPositionPath = this.circlePath(this.myScoutMarker.position, 100, 32)

    const outerBounds = [
      new google.maps.LatLng({lng: -11.3600718975, lat: 40.4630057984}),
      new google.maps.LatLng({lng: 31.5241158009, lat: 40.4630057984}),
      new google.maps.LatLng({lng: 31.5241158009, lat: 57.032878786}),
      new google.maps.LatLng({lng: -11.3600718975, lat: 57.032878786})
    ];

    // Should not be removed once out of the bounds_changed event
    this.map.data.forEach(function(feature) {
      this.map.data.remove(feature);
    }.bind(this))

    this.map.data.add({ geometry: new google.maps.Data.Polygon([outerBounds, userPositionPath, scoutPositionPath]) })
    this.map.data.setStyle({
      fillColor: '#000',
      fillOpacity: .75,
      strokeWeight: 0,
      clickable: false
    })

    return new google.maps.Polygon({paths: [userPositionPath, scoutPositionPath]})
  }

}
