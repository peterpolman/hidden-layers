import firebase from 'firebase';
import config from '../config.js'

import Path from '../models/Path'

import iconSrc from '../assets/img/wolf-1.png'

export default class PathService {
  constructor() {
    this.uid = null
    this.config = config
    this.scoutsRef = firebase.database().ref('scouts')
    this.paths = []
    this.directionsService = null
    this.pathTimers = []
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
      console.log('You are active');
    }.bind(this)

    window.onblur = function() {
      console.log('You are inactive');
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
      this.paths[uid].setMap(null)
      delete this.paths[uid]

      if (uid != this.uid) {
        const title = '🔔 Scout Arrived';
        const options = {
          body: `Your scout arrived at its destination!`,
          icon: iconSrc
        };
        window.swRegistration.showNotification(title, options);
      }


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
    var now = (new Date).getTime()
    var elapsed = (now - data.timestamp)
    var offset = (elapsed * ((1.4 / 10) / (1000 / 60))) // 1 ms / fps (requestAnimationFrame updates 60 fps)

    var walk = function(timestamp) {
      offset = offset + (1.4 / 10); // Walking speed should be 1.4m per second with a x10 speed modifier

      var currentOffsetPerct = (offset / data.totalDist) * 100
      var icons = this.paths[uid].get('icons')

      icons[0].offset = currentOffsetPerct + "%"

      this.paths[uid].set('icons', icons)

      if (offset >= data.totalDist) {
        this.update(uid, {
          path: null,
          totalDist: 0,
          mode: "STANDING",
          position: data.path[data.path.length - 1]
        })

      } else if (this.pathTimers[data.uid] != null) {
        this.pathTimers[uid] = window.requestAnimationFrame(walk.bind(this))
      }
    }

    this.pathTimers[uid] = window.requestAnimationFrame(walk.bind(this));
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
