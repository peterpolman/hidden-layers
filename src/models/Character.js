import firebase from 'firebase/app'
import 'firebase/database'

export default class Character {
    constructor(position, hitPoints) {
        this.attackPower = 5
        this.labelTimer = null
        this.hitPoints = 0
        this.position = null
        this.marker = new google.maps.Marker({
            position: position
        })
        this.indicator = new google.maps.Marker({
            zIndex: -99,
        });

        this.setPosition(position)
        this.setHitPoints(hitPoints)
    }

    set(key, value) {
        this[key] = value
    }

    get(key) {
        return this[key]
    }

	setMap(map) {
		this.marker.setMap(map)
		this.indicator.setMap(map)
	}

    setHitPoints(hitPoints) {
        this.hitPoints = (hitPoints < 0) ? 0 : hitPoints
        this.indicator.setIcon({
            path: `M0,0v17h100V0H0z M101,15H${ (this.hitPoints <= 0) ? 2 : this.hitPoints }l0-13H98V15z`,
            fillColor: (this.hitPoints > 50 ) ? '#8CC63E' : (this.hitPoints > 25) ? '#FFBB33' : '#ED1C24',
            fillOpacity: 1,
            scale: .5,
            strokeWeight: 0,
            anchor: new google.maps.Point(50,-55),
        })
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

    setLabel(text, heal = false) {
        const labelTimer = setTimeout(() => {
            this.marker.setLabel(null)
            clearTimeout(labelTimer)
        }, 1000)

        return this.marker.setLabel({
            text: ((text == 0) ? 'MISS' : text.toString()),
            color: (heal) ? '#00FF00' : '#FA2A00',
            fontWeight: 'bold',
            fontSize: '14px',
            fontFamily: 'Roboto'
        })
    }

    setPosition(position) {
        this.marker.setPosition(new google.maps.LatLng(position))
        this.indicator.setPosition(new google.maps.LatLng(position))
    }

    setVisible(visibility) {
        this.marker.setVisible(visibility)
        this.indicator.setVisible(visibility)
    }

    setMessage(message) {
        window.dispatchEvent(new CustomEvent('message_add', {
			detail: {
				message: message,
				timestamp: firebase.database.ServerValue.TIMESTAMP
			}
		}))
    }
}
