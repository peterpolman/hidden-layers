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
		this.hp = 100
		this.isWalking = (mode == "WALKING")
		this.marker = new google.maps.Marker({
			uid: uid,
			position: new google.maps.LatLng(position.lat, position.lng),
			zIndex: 1,
			label: null,
			icon: {
				labelOrigin: new google.maps.Point(size / 2, -5),
				url: ScoutSrc,
				size: new google.maps.Size(size, size),
				scaledSize: new google.maps.Size(size, size),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(size / 2, size / 2)
			}
		});

		this.indicator = new google.maps.Marker({
			position: new google.maps.LatLng(position.lat, position.lng),
			zIndex: -99,
			icon: {
	      path: 'M126,11c0,6.1-28.2,11-63,11S0,17.1,0,11S28.2,0,63,0S126,4.9,126,11z',
	      fillColor: '#3D91CB',
	      fillOpacity: 1,
	      scale: .4,
				strokeWeight: 0,
				anchor: new google.maps.Point(67,-28)
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
		return this.marker.setIcon({
			url: icon,
			size: new google.maps.Size(this.size, this.size),
			scaledSize: new google.maps.Size(this.size, this.size),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(this.size / 2, this.size / 2)
		})
	}

	setLabel(text) {
		this.marker.setLabel({
			text: text,
			color: '#FA2A00',
			fontWeight: 'bold',
			fontSize: '14px',
			fontFamily: 'Avenir'
		})

		this.labelTimer = setTimeout(function() {
			this.marker.setLabel(null)
			clearTimeout(this.labelTimer)
		}.bind(this), 1000)
	}

	setPosition(position) {
		this.marker.setPosition(new google.maps.LatLng(position))
		this.indicator.setPosition(new google.maps.LatLng(position))
	}

	setAnimation(animaton) {
		this.marker.setAnimation(animation)
	}

	nextStep(data) {
		var interval = 60;
		var meterPerSecond = .25
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
