import scoutSrc from '../assets/img/wolf-1.png';

import firebase from 'firebase';
import config from '../config.js'

import Path from './Path';

export default class Scout {
	constructor(uid, position, size, mode) {
		this.scoutRef = firebase.database().ref('scouts').child(uid)

		this.path = null
		this.pathTimer = null

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

	walk(data) {
		var interval = 100;
		var now = (new Date).getTime()
		var elapsed = ((now - data.timestamp) < 0) ? (interval * 2) : (now - data.timestamp)
		var offset = (elapsed / interval) * 1.4

		this.path = new Path(data.uid, data.path, '#3D91CB', '#3D91CB');

		var walk = function() {
			if (offset >= data.totalDist) {
        clearInterval(this.pathTimer)

				this.update({
					totalDist: 0,
					mode: "STANDING"
				})
			}
			else {
				offset = ((offset + 1.4) >= data.totalDist) ? data.totalDist : offset + 1.4;

				var position = this.path.GetPointAtDistance(offset);

				if (position != null) {
					this.update({
						position: {
							lat: position.lat(),
							lng: position.lng()
						}
					})
				}
			}
		}

		this.pathTimer = setInterval(walk.bind(this), interval)

		return this.path
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
