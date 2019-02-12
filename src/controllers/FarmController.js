import firebase from 'firebase/app';
import 'firebase/database';

import Farm from '../models/Building.js'
import config from '../config.js'

export default class FarmController {
    constructor() {
        this.uid = firebase.auth().currentUser.uid
        this.farm = null
        this.farms = {}
        this.farmsRef = firebase.database().ref('farms')
        this.usersRef = firebase.database().ref('users')

        this.farmsRef.on('child_added', (snap) => {
            this.onFarmAdded(snap.key, snap.val())
        })

        this.farmsRef.on('child_changed', (snap) => {
            this.onFarmChanged(snap.key, snap.val())
        })

        this.farmsRef.on('child_removed', (snap) => {
            this.onFarmRemoved(snap.key, snap.val())
        })
    }

    onFarmAdded(key, data) {
        this.farms[key] = {
            stone: data.stone,
            water: data.water,
            lumber: data.lumber,
            resource: data.resource,
            id: data.id,
            uid: data.uid,
            marker: new google.maps.Marker({
                id: data.id,
                position: data.position,
                icon: {
                    url: require('../assets/img/x.png'),
                    size: new google.maps.Size(25, 25),
                    scaledSize: new google.maps.Size(25, 25),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(25/2, 25/2),
                }
            })
        }

        this.farms[key].marker.addListener('click', () => {
            alert(this.farms[key].water, this.farms[key].lumber, this.farms[key].stone)
        })
        this.farms[key].marker.setMap(MAP)
    }

    onFarmChanged(key, data) {
        this.farms[key].marker.setPosition(data.position)
        this.farms[key].resource = data.resource
    }

    onFarmRemoved(key, data) {
        delete this.farms[key]
    }

    gatherResources(position) {
        const url = `https://maps.googleapis.com/maps/api/staticmap?center=${position.lat},${position.lng}&zoom=${MAP.getZoom()}&size=1x1&maptype=roadmap&key=${config.maps.key}`

        let img = new Image()

        img.crossOrigin = "Anonymous";
        img.onload = () => this.defineResourceType(position, img)
        img.src = url
    }

    defineResourceType(position, img) {
        let canvas = document.createElement('canvas');

        canvas.width = 1;
        canvas.height = 1;
        canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

        let px = canvas.getContext('2d').getImageData(0, 0, 1, 1).data;

        const lumber = new Uint8ClampedArray([192, 236, 174, 255])
        const stone = new Uint8ClampedArray([255, 255, 255, 255])
        const water = new Uint8ClampedArray([171, 219, 255, 255])
        const isWater = ((px[0] == water[0]) && (px[1] == water[1]) && (px[2] == water[2]))
        const isStone = ((px[0] == stone[0]) && (px[1] == stone[1]) && (px[2] == stone[2]))
        const isLumber = ((px[0] == lumber[0]) && (px[1] == lumber[1]) && (px[2] == lumber[2]))

        let resource = ''

        if (isWater) {
            resource = 'water'
        }
        if (isStone) {
            resource = 'stone'
        }
        if (isLumber) {
            resource = 'lumber'
        }

        if (resource != '') {
            this.create(position, resource)
        }

        alert(`You are farming ${resource} now.`)
    }

    createMarkerId(latLng) {
        const id = (latLng.lat + "_" + latLng.lng)
        return id.replace(/\./g, '')
    }

    create(position, resource) {
        this.farmsRef.child(this.uid).set({
            id: this.createMarkerId(position),
            uid: this.uid,
            position: position,
            resource: resource,
            water: 0,
            stone: 0,
            lumber: 0,
        })
    }
}
