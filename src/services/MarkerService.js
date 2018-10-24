import firebase from 'firebase';
import maleSrc from '../assets/img/user-male.png';
import femaleSrc from '../assets/img/user-female.png';

export default class MarkerService {
  constructor() {
    this.map = null
    this.markers = firebase.database().ref('markers')
    this.userMarkers = []
    this.directionMarkers = []
    this.avatars = {
      male: maleSrc,
      female: femaleSrc
    }
  }

  listen(map) {
    this.map = map

    this.markers.on('child_added', function(snap) {
      this.onChildAdded(snap.key, snap.val())
    }.bind(this));

    this.markers.on('child_changed', function(snap) {
      this.onChildChanged(snap.key, snap.val());
    }.bind(this));

    this.markers.on('child_removed', function(snap) {
      this.onChildRemoved(snap.key);
    }.bind(this));
  }

  onChildAdded(key, data) {
    const marker = new google.maps.Marker({
      icon: {
        id: key,
        path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
        fillColor: '#FF0000',
        fillOpacity: .75,
        anchor: new google.maps.Point(0,0),
        strokeWeight: 0,
        scale: .3
      }
    });

    this.directionMarkers[key] = marker;

    marker.setPosition(data.position);
    marker.setMap(this.map);
  }

  onChildChanged(key, data) {
    const marker = this.directionMarkers[key]
    const latlng = new google.maps.LatLng(data.position.lat, data.position.lng)

    marker.setPosition(latlng)
  }

  onChildRemoved(key) {
    return this.directionMarkers[key].setMap(null)
  }

  createMarker(key, data) {
    return this.markers.child(key).set(data)
  }

  updateMarker(key, data, i, length) {
    return this.markers.child(key).update(data)
  }

  removeMarker(key) {
    return this.markers.child(key).remove()
  }

  createUserMarker(uid, data, me) {
    const userMarker = new google.maps.Marker({
      id: uid,
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
