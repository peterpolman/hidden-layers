import firebase from 'firebase/app';
import 'firebase/database';

import ScoutSrc from '../assets/img/wolf-0.png';

import config from '../config.js'

export default class Scout {
	constructor(uid, position, size, mode, hp) {
		this.scoutRef = firebase.database().ref('scouts').child(uid)

		this.size = size
		this.path = null
		this.pathTimer = null
		this.mode = 'STANDING'
		this.hp = hp
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
	      path: `M0,0v17h100V0H0z M101,15H${this.hp}l0-13H98V15z`,
				fillColor: (this.hp > 50 ) ? '#8CC63E' : (this.hp > 25) ? '#FFBB33' : '#ED1C24',
      	fillOpacity: 1,
	      scale: .5,
				strokeWeight: 0,
				anchor: new google.maps.Point(55,-40),
	    }
		});
	}

	renderHP(hp) {
		return `M0,0v17h100V0H0z M101,15H${hp}l0-13H98V15z`
	}

	setHitPoints(hp) {
		this.hp  = (hp < 0) ? 0 : hp
		this.indicator.setIcon({
      path: this.renderHP(hp),
			fillColor: (this.hp > 50 ) ? '#8CC63E' : (this.hp > 25) ? '#FFBB33' : '#ED1C24',
      fillOpacity: 1,
      scale: .5,
			strokeWeight: 0,
			anchor: new google.maps.Point(55,-40),
    })
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
		if (text == 0) {
      text = 'MISS'
    }

		this.marker.setLabel({
			text: text.toString(),
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

	setVisible(visibility) {
		this.marker.setVisible(visibility)
		this.indicator.setVisible(visibility)
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

	setMap(map) {
		this.marker.setMap(map)
		this.indicator.setMap(map)
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

	die() {
		return this.scoutRef.remove()
	}
}
