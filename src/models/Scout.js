import Character from './Character.js'
import firebase from 'firebase/app';
import 'firebase/database';

import config from '../config.js'

export default class Scout extends Character {
	constructor(data) {
		super(data.position, data.hitPoints)
		const iconSize = 40

		this.uid = data.uid
		this.scoutRef = firebase.database().ref('scouts').child(data.uid)
        this.path = null
        this.pathTimer = null
        this.mode = 'STANDING'
        this.isWalking = (data.mode == "WALKING")
        this.marker.setIcon({
			url: require('../assets/img/wolf-0.png'),
			labelOrigin: new google.maps.Point(iconSize / 2, (iconSize / 2) - 5),
			size: new google.maps.Size(iconSize, iconSize),
			scaledSize: new google.maps.Size(iconSize, iconSize),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(iconSize / 2, (iconSize / 2) - 5)
		})
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

	setMode(mode) {
		return this.update({
			mode: mode,
			totalDist: null,
			path: null,
			timestamp: null,
			startTimestamp: null
		})
	}

	update(data) {
		return this.scoutRef.update(data);
	}

	kill() {
		return this.scoutRef.remove()
	}

	die() {
		return this.setMap(null)
	}
}
