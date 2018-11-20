import firebase from 'firebase';
import PathService from './PathService';
import Scout from '../models/Scout'

export default class ScoutService {
  constructor() {
    this.uid = firebase.auth().currentUser.uid
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

    const bounds = this.map.getBounds()
    this.setGrid(bounds)

    console.log(`[ADD] SCOUT ${uid}`)
  }

  onChildChanged(uid, data) {
    this.scoutMarkers[uid].setPosition(data.position)
    this.scoutMarkers[uid].set('mode', data.mode)

    const bounds = this.map.getBounds()
    this.setGrid(bounds)

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

  circlePath(center, radius, points) {
    var a = [], p = 360 / points, d = 0;

    for (var i = 0; i < points; ++i, d+= p) {
      a.push(google.maps.geometry.spherical.computeOffset(center, radius, d));
    }

    return a
  }

  setGrid(bounds) {
    var sw = bounds.getSouthWest()
    var ne = bounds.getNorthEast()
    var se = new google.maps.LatLng(ne.lat(), sw.lng())
    var nw = new google.maps.LatLng(sw.lat(), ne.lng())

    // @TODO Outer bounds should cover the full map, then move the method out of the bounds_changed event
    // var outerCoords = [
    //   new google.maps.LatLng({lat: -90, lng: 180}), // nw
    //   new google.maps.LatLng({lat: -90, lng: -180}), // sw
    //   new google.maps.LatLng({lat: 90, lng: -180}), // se
    //   new google.maps.LatLng({lat: 90, lng: 180}) // ne
    // ];

    var outerBounds = [nw, sw, se, ne]

    if (typeof this.userMarkers[this.uid] != 'undefined' && typeof this.userMarkers[this.uid] != 'undefined') {
      var discovered = []

      var userPosition = this.userMarkers[this.uid].position
      var userPositionPath = this.circlePath(userPosition, 100, 32)

      var scoutPosition = this.scoutMarkers[this.uid].position
      var scoutPositionPath = this.circlePath(scoutPosition, 50, 32)

      // Should not be removed once out of the bounds_changed event
      this.map.data.forEach(function(feature) {
        this.map.data.remove(feature);
      }.bind(this))

      // this.dataLayer = new google.maps.Data();
      this.map.data.add({ geometry: new google.maps.Data.Polygon([outerBounds, userPositionPath, scoutPositionPath]) })
      this.map.data.setStyle({
        fillColor: '#000',
        fillOpacity: .75,
        strokeWeight: 0,
        clickable: false
      })
    }
  }

}
