import Character from './Character.js'
import firebase from 'firebase/app';
import 'firebase/database';

import config from '../config.js'

export default class Scout extends Character {
	constructor(uid, mode, position, hitPoints) {
		super(position, hitPoints)
		const iconSize = 40

		this.uid = uid
		this.scoutRef = firebase.database().ref('scouts').child(uid)
        this.path = null
        this.pathTimer = null
        this.mode = 'STANDING'
        this.isWalking = (mode == "WALKING")
        this.marker = new google.maps.Marker({
            uid: uid,
            position: new google.maps.LatLng(position.lat, position.lng),
            zIndex: 1,
            label: null,
            icon: {
				labelOrigin: new google.maps.Point(iconSize / 2, (iconSize / 2) - 5),
				url: require('../assets/img/wolf-0.png'),
                size: new google.maps.Size(iconSize, iconSize),
                scaledSize: new google.maps.Size(iconSize, iconSize),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(iconSize / 2, (iconSize / 2) - 5)
            }
        });
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
