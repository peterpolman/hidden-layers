import firebase from 'firebase';
import config from '../config.js'

import Path from '../models/Path'

export default class PathService {
  constructor() {
    this.config = config
    this.scoutsRef = firebase.database().ref('scouts')
    this.paths = []
    this.directionsService = null
    this.pathTimer = []
  }

  listen(map) {
    this.map = map
    this.directionsService = new google.maps.DirectionsService()

    this.scoutsRef.on('child_added', function(snap) {
      this.onPathAdded(snap.key, snap.val())
    }.bind(this))

    this.scoutsRef.on('child_changed', function(snap) {
      this.onPathChanged(snap.key, snap.val())
    }.bind(this))

    window.onfocus = function() {
      // this.move(this.uid)
    }.bind(this)

    window.onblur = function() {
      console.log('You are active');
    }

  }

  onPathAdded(uid, data) {
    if (data.mode == "WALKING") {
      if (typeof this.paths[uid] == 'undefined' || this.paths[uid] == null) {
        this.paths[uid] = new Path(uid, data.path, '#3D91CB', '#3D91CB', this.map);
        this.move(uid, data)

        console.log(`[UPDATE] is_walking ${uid}`);
      }
    }
  }

  onPathChanged(uid, data) {
    if (data.mode == "WALKING") {
      if (typeof this.paths[uid] == 'undefined' || this.paths[uid] == null) {
        this.paths[uid] = new Path(uid, data.path, '#3D91CB', '#3D91CB', this.map);
        this.move(uid, data)

        console.log(`[UPDATE] is_walking ${uid}`);
      }
    }
    if (data.mode == "STANDING") {
      if (typeof this.pathTimer[uid] != 'undefined') {
        window.clearInterval(this.pathTimer[uid])
      }
      this.paths[uid].setMap(null)
      this.paths[uid] = null

      // Also clear running timers of broken paths (should be no problem when timers pick up on the existing paths agains)

      console.log(`[UPDATE] is_standing ${uid}`);
    }
  }

  remove(uid) {
    return this.scoutsRef.child(uid).update({mode: "STANDING", path: null})
  }

  update(uid, data) {
    return this.scoutsRef.child(uid).update(data);
  }

  move(uid, data) {
    var offset = (((new Date).getTime() - data.timestamp) / 1000) * 10 // speed

    // window.clearInterval(this.pathTimer[uid])
    this.pathTimer[uid] = window.setInterval(function() {
      offset = offset + (10 / (1000 / this.config.fps)); // Walking speed should be 1.4m per second

      var currentOffsetPerct = (offset / data.totalDist) * 100
      var icons = this.paths[uid].get('icons')

      icons[0].offset = currentOffsetPerct + "%"

      this.paths[uid].set('icons', icons)

      if (offset >= data.totalDist) {
        window.clearInterval(this.pathTimer[uid])
        this.paths[uid].setMap(null)

        this.update(uid, {
          path: null,
          totalDist: 0,
          mode: "STANDING",
          position: data.path[data.path.length - 1]
        })
      }
    }.bind(this), this.config.fps)
  }

  route(uid, fromLatlng, toLatlng, travelMode) {
    this.directionsService.route({
      origin: fromLatlng,
      destination: toLatlng,
      travelMode: travelMode
    }, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        const sphericalLib = google.maps.geometry.spherical
        const route = response.routes[0].overview_path
        const totalDist = sphericalLib.computeDistanceBetween( route[0], route[route.length - 1])

        if (totalDist < 5000) {
          const data = {
            mode: travelMode,
            uid: uid,
            position: {
              lat: fromLatlng.lat(),
              lng: fromLatlng.lng()
            },
            totalDist: totalDist,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            path: []
          }

          for (var i = 0; i < route.length; i++) {
            data.path[i] = { lat: route[i].lat(), lng: route[i].lng() }
          }

          this.update(uid, data)
          console.log(`Let's walk ${totalDist}m`);
        }
        else {
          console.log(`Don't go so far! 5000 meter is max.`);
        }


      } else {
        console.warn('Directions request failed due to ' + status);
      }

    }.bind(this));
  }
}
