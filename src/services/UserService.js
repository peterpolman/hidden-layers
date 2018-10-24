import firebase from 'firebase';
import MarkerService from './MarkerService';

export default class UserService {
  constructor() {
    this.map = null
    this.db = firebase.database()
    this.users = this.db.ref('users')
    this.currentUser = firebase.auth().currentUser
    this.markerService = new MarkerService
  }

  listen(map) {
    this.map = map;

    if (this.currentUser != null) {
      const connectedRef = this.db.ref('.info/connected');
      const userConnectionsRef = this.users.child(this.currentUser.uid).child('connections');
      const lastOnlineRef = this.users.child(this.currentUser.uid).child('lastOnline');

      connectedRef.on('value', function(snap) {
        if (snap.val() === true)  {
          const connection = userConnectionsRef.push();

          connection.onDisconnect().remove();
          connection.set(true);
          lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
        }
      });
    }

    this.users.on('child_added', function(snap) {
      this.onChildAdded(snap.key, snap.val())

      if (this.currentUser.uid === snap.key) {
        this.currentUser['userData'] = snap.val()
      }
    }.bind(this));

    this.users.on('child_changed', function(snap) {
      this.onChildChanged(snap.key, snap.val());
    }.bind(this));

    this.users.on('child_removed', function(snap) {
      this.onChildRemoved(snap.key);
    }.bind(this));
  }

  onChildAdded(uid, data) {
    if (data.position != null) {
      const marker = this.createUser(uid, data)
      const latlng = new google.maps.LatLng(data.position.lat, data.position.lng)

      if (typeof marker != 'undefined') {
        marker.addListener('click', function(e){
          const options = { content: `<strong>${data.username}</strong>` , isHidden: false };
          const infoWindow = new google.maps.InfoWindow(options);

          infoWindow.open(this.map, marker);
          this.map.panTo(e.latLng)
        }.bind(this))

        marker.setPosition(latlng)

        return marker.setMap(this.map);
      }
    }
  }

  onChildChanged(uid, data) {
    const marker = this.updateUser(uid, data)
    const latlng = new google.maps.LatLng(data.position.lat, data.position.lng)

    if (typeof marker != 'undefined') {
      return marker.setPosition(latlng)
    }
  }

  onChildRemoved(uid) {
    return this.removeUser(uid)
  }

  createUser(uid, data) {
    const me = (this.currentUser != null && this.currentUser.uid === uid) ? true : false

    this.users.child(uid).set(data)

    console.log(`User ${uid} created`)

    return this.markerService.createUserMarker(uid, data, me)
  }

  updateUser(uid, data) {
    const updates = {
      '/position': data.position
    }

    this.users.child(uid).update(updates);

    console.log(`User ${uid} updated`)

    return this.markerService.updateUserMarker(uid, data)
  }

  removeUser(uid) {
    console.log(`User ${uid} removed`)

    return this.users.child(uid).remove();
  }
}
