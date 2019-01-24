export default class Character {
    constructor(position, hitPoints) {
        // debugger
        const latlng = new google.maps.LatLng(position.lat, position.lng)

        this.attackPower = 5
        this.labelTimer = null
        this.hitPoints = hitPoints
        this.position = latlng
        this.indicator = new google.maps.Marker({
            position: this.position,
            icon: null,
            zIndex: -99,
        });

        this.setHitPoints(this.hitPoints)
    }

    set(key, value) {
        this[key] = value
    }

    get(key) {
        return this[key]
    }

    setHitPoints(hitPoints) {
        this.hitPoints = (hitPoints < 0) ? 0 : hitPoints
        this.indicator.setIcon({
            path: `M0,0v17h100V0H0z M101,15H${ hitPoints }l0-13H98V15z`,
            fillColor: (this.hitPoints > 50 ) ? '#8CC63E' : (this.hitPoints > 25) ? '#FFBB33' : '#ED1C24',
            fillOpacity: 1,
            scale: .5,
            strokeWeight: 0,
            anchor: new google.maps.Point(55,-40),
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

    setLabel(text) {
        const labelTimer = setTimeout(() => {
            this.marker.setLabel(null)
            clearTimeout(labelTimer)
        }, 1000)

        return this.marker.setLabel({
            text: ((text == 0) ? 'MISS' : text.toString()),
            color: '#FA2A00',
            fontWeight: 'bold',
            fontSize: '14px',
            fontFamily: 'Avenir'
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
}
