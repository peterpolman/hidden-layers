import firebase from 'firebase';
import User from '../models/User'

export default class UserService {
  constructor() {
    this.map = null
    this.usersRef = firebase.database().ref('users')
    this.userMarkers = []
    this.currentUser = firebase.auth().currentUser
  }

  listen(map) {
    this.map = map;

    if (this.currentUser != null) {
      const connectedRef = firebase.database().ref('.info/connected');

      const userConnectionsRef = this.usersRef.child(this.currentUser.uid).child('connections');
      const lastOnlineRef = this.usersRef.child(this.currentUser.uid).child('lastOnline');

      connectedRef.on('value', function(snap) {
        if (snap.val() === true)  {
          const connection = userConnectionsRef.push();

          connection.onDisconnect().remove();
          connection.set(true);
          lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
        }
      });
    }

    this.usersRef.on('child_added', function(snap) {
      this.onChildAdded(snap.key, snap.val())

      if (this.currentUser.uid === snap.key) {
        this.currentUser = snap.val()
      }
    }.bind(this));

    this.usersRef.on('child_changed', function(snap) {
      this.onChildChanged(snap.key, snap.val());

      if (this.currentUser.uid === snap.key) {
        this.currentUser = snap.val()
      }
    }.bind(this));

    this.usersRef.on('child_removed', function(snap) {
      this.onChildRemoved(snap.key);
    }.bind(this));
  }

  onChildAdded(uid, data) {
    if (data.position != null) {
      const marker = this.createUser(uid, data)
      const latlng = new google.maps.LatLng(data.position.lat, data.position.lng)

      if (typeof marker != 'undefined') {
        marker.addListener('click', function(e){
          const options = {
            content: `<strong>${data.username}</strong><br>
                      <small>Last online: ${new Date(data.lastOnline).toLocaleString("nl-NL")}</small>`,
            isHidden: false
          }
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

    if (typeof marker != 'undefined') {
      return marker.setPosition(new google.maps.LatLng(data.position.lat, data.position.lng))
    }
  }

  onChildRemoved(uid) {
    return this.removeUser(uid)
  }

  createUser(uid, data) {
    const me = (this.currentUser != null && this.currentUser.uid === uid) ? true : false

    this.usersRef.child(uid).set(data)

    console.log(`User ${uid} created`)

    return this.createUserMarker(uid, data, me)
  }

  updateUser(uid, data) {
    this.usersRef.child(uid).update(data);

    console.log(`User ${uid} updated`)

    return this.updateUserMarker(uid, data)
  }

  removeUser(uid) {
    console.log(`User ${uid} removed`)

    return this.usersRef.child(uid).remove();
  }

  createUserMarker(uid, data, me) {
    return this.userMarkers[uid] = new User(uid, data.position, data.gender, 40, me);
  }

  updateUserMarker(uid, data) {
    this.userMarkers[uid]

    return this.userMarkers[uid]
  }
}
