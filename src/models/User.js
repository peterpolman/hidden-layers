import firebase from 'firebase/app'
import 'firebase/database';

import Character from './Character.js'

export default class User extends Character {
    constructor(uid, position, userClass, username, email, hitPoints) {
        super(position, hitPoints)
        const iconSize = 50
        const avatars = {
            knight: require('../assets/img/knight-1.png'),
            archer: require('../assets/img/archer-1.png')
        }
        this.userRef = firebase.database().ref('users').child(uid)
        this.marker = new google.maps.Marker({
            uid: uid,
            position: new google.maps.LatLng(position.lat, position.lng),
            username: username,
            email: email,
            icon: {
                labelOrigin: new google.maps.Point(iconSize / 2, -10),
                url: avatars[userClass],
                size: new google.maps.Size(iconSize, iconSize),
                scaledSize: new google.maps.Size(iconSize, iconSize),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(iconSize / 2, iconSize / 2)
            }
        });
    }

	update(data) {
		return this.userRef.update(data);
	}
}
