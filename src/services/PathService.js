import firebase from 'firebase';

import config from '../config.js'
import walkerSrc from '../assets/img/user-me.png';

export default class PathService {
  constructor() {
    this.config = config
    this.paths = []
    this.pathsRef = firebase.database().ref('paths')
    this.directionsService = null
    this.avatars = {
      walker: walkerSrc
    }

  }

  listen(map) {
    this.map = map
    this.directionsService = new google.maps.DirectionsService()

    this.pathsRef.on('child_added', function(snap) {
      this.onChildAdded(snap.key, snap.val())
    }.bind(this));

    this.pathsRef.on('child_changed', function(snap) {
      this.onChildChanged(snap.key, snap.val());
    }.bind(this));

  }

  onChildAdded(uid, data) {
    const sphericalLib = google.maps.geometry.spherical;

    var pointDistances = [];
    var firstPoint = new google.maps.LatLng(data.path[0]);
    var amountOfPoints = data.path.length
    var totalDist = sphericalLib.computeDistanceBetween(
      firstPoint,
      new google.maps.LatLng(data.path[amountOfPoints - 1])
    );

    for (var i = 0; i < amountOfPoints; i++) {
        var latlng = new google.maps.LatLng(data.path[i])
        pointDistances[i] = 100 * sphericalLib.computeDistanceBetween(latlng, firstPoint) / totalDist;
    }

    var path = new google.maps.Polyline({
        uid: uid,
        path: data.path,
        strokeColor: '#3D91CB',
        strokeOpacity: 0.5,
        strokeWeight: 3,
        icons: [{
          icon: {
            path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
            fillColor: '#3D91CB',
            fillOpacity: .75,
            anchor: new google.maps.Point(0,0),
            strokeWeight: 0,
            scale: .3
          },
          offset: '100%'
        }],
        map: this.map
    });

    this.paths[uid] = path;
    this.animatePath(uid, data)
  }

  onChildChanged(uid, data) {
    console.log(`Walker changed`);
  }

  createPath(uid, data) {
    this.pathsRef.child(uid).set(data)
  }

  updatePath(uid, data) {
    return this.pathsRef.child(uid).update(data);
  }

  removePath(uid) {
    return this.pathsRef.child(uid).remove()
  }

  animatePath(uid, data) {
    var offset = data.offset

    var intervalIndex = window.setInterval(function() {
      offset = offset + .5; // add mph in equasion

      var icons = this.paths[uid].get('icons')
      icons[0].offset = (offset) + '%'

      this.paths[uid].set('icons', icons)

      if (this.paths[uid].get('icons')[0].offset >= "99.5%") {
        icons[0].offset = '100%'
        this.paths[uid].set('icons', icons)

        window.clearInterval(intervalIndex)

        this.paths[uid].setMap(null)

        this.removePath(uid)
      }
    }.bind(this), this.config.fps)
  }

  createRoute(uid, fromLatlng, toLatlng, travelMode) {
    const data = {
      uid: uid,
      offset: 0,
      path: []
    }

    this.directionsService.route({
        origin: fromLatlng,
        destination: toLatlng,
        travelMode: travelMode
      }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {

          for (var i = 0; i < response.routes[0].overview_path.length; i++) {
            data.path.push({
              lat: response.routes[0].overview_path[i].lat(),
              lng: response.routes[0].overview_path[i].lng()
            })
          }

          if (typeof this.paths[data.id] == 'undefined') {
            this.createPath(uid, data)
          } else {
            this.updatePath(uid, data)
          }

        } else {
          console.warn('Directions request failed due to ' + status);
        }

      }.bind(this)
    );
  }
}
