import firebase from 'firebase/app';
import 'firebase/database';

import ScoutSrc from '../assets/img/wolf-0.png';

import config from '../config.js'

export default class Scout {
	constructor(uid, position, size, mode) {
		this.scoutRef = firebase.database().ref('scouts').child(uid)
		this.size = size
		this.path = null
		this.pathTimer = null
		this.mode = 'STANDING'
		this.isWalking = (mode == "WALKING")
		this.marker = new google.maps.Marker({
			uid: uid,
			position: new google.maps.LatLng(position.lat, position.lng),
			icon: {
				url: ScoutSrc,
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

	setIcon(icon) {
		this.marker.setIcon({
			url: icon,
			size: new google.maps.Size(this.size, this.size),
			scaledSize: new google.maps.Size(this.size, this.size),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(this.size / 2, this.size / 2)
		})
	}

	setPosition(position) {
		this.marker.setPosition(new google.maps.LatLng(position))
	}

	setAnimation(animaton) {
		this.marker.setAnimation(animation)
	}

	nextStep(data) {
		var interval = 100;
		var meterPerSecond = 1
		var offset = ((data.timestamp - data.startTimestamp) / interval) * meterPerSecond

		var walk = function() {
			if (offset >= data.totalDist) {
				this.update({
					mode: "STANDING",
					totalDist: null,
					path: null,
					timestamp: null,
					startTimestamp: null
				})
			}
			else {
				const point = ((offset + meterPerSecond) > data.totalDist) ? data.totalDist : offset
				const position = this.path.GetPointAtDistance(point + meterPerSecond);

				if (position != null) {
					this.update({
						timestamp: firebase.database.ServerValue.TIMESTAMP,
						position: {
							lat: position.lat(),
							lng: position.lng()
						}
					})
				}
			}
		}

		this.pathTimer = setTimeout(walk.bind(this), interval)
	}

	stop() {
		return this.update({
			mode: "STANDING",
			totalDist: null,
			path: null,
			timestamp: null,
			startTimestamp: null
		})
	}

	update(data) {
		return this.scoutRef.update(data);
	}
}
