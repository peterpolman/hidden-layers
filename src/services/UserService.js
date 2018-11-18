import firebase from 'firebase';
import User from '../models/User'

export default class UserService {
  constructor() {
    this.map = null
    this.usersRef = firebase.database().ref('users')
    this.connectedRef = firebase.database().ref('.info/connected')
    this.userMarkers = []
    this.currentUser = firebase.auth().currentUser
    this.infoWindow = null
  }

  listen(map) {
    this.map = map;
    this.infoWindow = new google.maps.InfoWindow({
      isHidden: false
    });

    const userConnectionsRef = this.usersRef.child(this.currentUser.uid).child('connections');
    const lastOnlineRef = this.usersRef.child(this.currentUser.uid).child('lastOnline');

    this.connectedRef.on('value', function(snap) {
      if (snap.val() === true)  {
        const connection = userConnectionsRef.push();

        connection.onDisconnect().remove();
        connection.set(true);
        lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
      }
    });

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
    const me = (this.currentUser != null && this.currentUser.uid === uid) ? true : false
    this.userMarkers[uid] = new User(uid, data.position, data.gender, data.username, data.email, 40, me);
    this.userMarkers[uid].addListener('click', function(e){
      const content = `<strong>${data.username}</strong><br><small>Last online: ${new Date(data.lastOnline).toLocaleString("nl-NL")}</small>`

      this.infoWindow.setContent(content);
      this.infoWindow.open(this.map, this.userMarkers[uid]);

      this.map.panTo(e.latLng)
    }.bind(this))

    this.userMarkers[uid].setMap(this.map);
  }

  onChildChanged(uid, data) {
    const latlng = new google.maps.LatLng(data.position.lat, data.position.lng)
    this.userMarkers[uid].setPosition(latlng)
  }

  onChildRemoved(uid) {
    this.userMarkers[uid].setMap(null)
    this.userMarkers.splice(uid, 1)
  }

  createUser(uid, data) {
    this.usersRef.child(uid).set(data)

    console.log(`User ${uid} created`)
  }

  updateUser(uid, data) {
    this.usersRef.child(uid).update(data);

    console.log(`User ${uid} updated`)
  }

  removeUser(uid) {
    this.usersRef.child(uid).remove();

    console.log(`User ${uid} removed`)
  }

}
