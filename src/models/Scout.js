import scoutSrc from '../assets/img/wolf-1.png';

import firebase from 'firebase';
import config from '../config.js'

import Path from './Path';

export default class Scout {
	constructor(uid, position, size, mode) {
		this.scoutRef = firebase.database().ref('scouts').child(uid)

		this.path = null
		this.pathTimer = []

		this.mode = 'STANDING'

		this.marker = new google.maps.Marker({
			uid: uid,
			position: new google.maps.LatLng(position.lat, position.lng),
			icon: {
				url: scoutSrc,
				size: new google.maps.Size(size, size),
				scaledSize: new google.maps.Size(size, size),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(size / 2, size / 2)
			}
		});
	}

	set(key, value) {
		this[key] = value
	}

	get(key) {
		return this[key]
	}

	setPosition(position) {
		this.marker.setPosition(new google.maps.LatLng(position))
	}

	walk(data, map) {
		var now = (new Date).getTime()
		var elapsed = (now - data.timestamp)
		var offset = (elapsed / 200) * 1.4 // 1 ms / fps (requestAnimationFrame updates 60 fps)

		this.path = new Path(data.uid, data.path, '#3D91CB', '#3D91CB', map);

		var walk = function(e) {
      const position = this.path.GetPointAtDistance(offset);

			if (offset >= data.totalDist) {
        clearInterval(this.pathTimer)

				this.update({
					totalDist: 0,
					mode: "STANDING"
				})
			}
      else {
        this.marker.setPosition(position)

        this.update({
          position: {
            lat: position.lat(),
            lng: position.lng()
          }
        })

        offset = offset + 1.4; // Walking speed should be 1.4m per second with a x10 speed modifier
      }
		}

		this.pathTimer = setInterval(walk.bind(this), 200)
	}

	stop() {
    clearInterval(this.pathTimer)

		return this.update({
      totalDist: 0,
      mode: "STANDING"
    })
	}

	update(data) {
		return this.scoutRef.update(data);
	}
}
