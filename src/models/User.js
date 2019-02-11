import firebase from 'firebase/app'
import 'firebase/database';

import Character from './Character.js'

export default class User extends Character {
    constructor(data) {
        super(data.position, data.hitPoints)
        const iconSize = {
            w: (data.userClass == 'wizard') ? 55 : 50,
            h: (data.userClass == 'wizard') ? 70 : 50
        }
        const avatars = {
            knight: require('../assets/img/knight-1.png'),
            archer: require('../assets/img/archer-1.png'),
            wizard: require('../assets/img/wizard-1.png')
        }
        this.uid = data.uid
        this.exp = parseInt(data.exp)
        this.username = data.username
        this.userClass = data.userClass
        this.email = data.email
        this.marker = new google.maps.Marker({
            position: new google.maps.LatLng(data.position.lat, data.position.lng),
            icon: {
                labelOrigin: new google.maps.Point(iconSize.w / 2, -10),
                url: avatars[data.userClass],
                size: new google.maps.Size(iconSize.w, iconSize.h),
                scaledSize: new google.maps.Size(iconSize.w, iconSize.h),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(iconSize.w / 2, ((data.userClass == 'wizard') ? iconSize.h / 2 + 10: iconSize.h / 2))
            }
        })
    }

    setExp(exp) {
        this.exp = exp
    }
}
