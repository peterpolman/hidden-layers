import firebase from 'firebase/app'
import 'firebase/database';

import Character from './Character.js'

export default class User extends Character {
    constructor(uid, position, userClass, username, email, hitPoints, exp) {
        super(position, hitPoints)
        const iconSize = {
            w: (userClass == 'wizard') ? 60 : 50,
            h: (userClass == 'wizard') ? 75 : 50
        }
        const avatars = {
            knight: require('../assets/img/knight-1.png'),
            archer: require('../assets/img/archer-1.png'),
            wizard: require('../assets/img/wizard-1.png')
        }
        this.uid = uid
        this.exp = parseInt(exp)
        this.username = username
        this.email = email
        this.marker = new google.maps.Marker({
            position: new google.maps.LatLng(position.lat, position.lng),
            icon: {
                labelOrigin: new google.maps.Point(iconSize.w / 2, -10),
                url: avatars[userClass],
                size: new google.maps.Size(iconSize.w, iconSize.h),
                scaledSize: new google.maps.Size(iconSize.w, iconSize.h),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(iconSize.w / 2, ((userClass == 'wizard') ? iconSize.h / 2 + 12: iconSize.h / 2))
            }
        })
    }

    setExp(exp) {
        this.exp = exp
    }
}
