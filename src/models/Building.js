export default class Building {
    constructor(uid, id, slug, name, position, size, stage, hitPoints) {
        this.uid = uid
        this.name = name
        this.slug = slug
        this.size = size
        this.stage = stage
        this.hitPoints = hitPoints
        this.icons = {
            house1: require('../assets/img/house-1.png'),
            house2: require('../assets/img/house-2.png'),
            house3: require('../assets/img/house-3.png'),
            house4: require('../assets/img/house-4.png'),
        }
        this.indicator = new google.maps.Marker({
            zIndex: 200,
        })
        this.marker = new google.maps.Marker({
            id: id,
            position: position
        })

        this.setHitPoints(this.hitPoints)
        this.setVisible(true)
        this.setPosition(position)
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

    setPosition(position) {
        this.marker.setPosition(new google.maps.LatLng(position))
        this.indicator.setPosition(new google.maps.LatLng(position))
    }

    setVisible(visibility) {
        this.marker.setVisible(visibility)
        this.indicator.setVisible(visibility)
    }

    setHitPoints(hitPoints) {
        this.hitPoints = (hitPoints < 0) ? 0 : hitPoints
        this.hitPoints = (hitPoints > 300) ? 300 : hitPoints

        let stage = (this.hitPoints >= 300) ? 4 : (this.hitPoints > 200) ? 3 : (this.hitPoints > 100) ? 2 : (this.hitPoints > 0) ? 1 : 1

        this.marker.setIcon({
            url: this.icons[`${this.slug}${stage}`],
            size: new google.maps.Size(this.size, this.size),
            scaledSize: new google.maps.Size(this.size, this.size),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point((this.size / 2), (this.size / 2))
        })

        const perct = (this.hitPoints/ 300) * 100

        this.indicator.setIcon({
            path: `M0,0v17h100V0H0z M101,15H${ (perct <= 0)? 2 : perct }l0-13H98V15z`,
            fillColor: (perct > 50 ) ? '#8CC63E' : (perct > 25) ? '#FFBB33' : '#ED1C24',
            fillOpacity: 1,
            scale: .5,
            strokeWeight: 0,
            anchor: new google.maps.Point(50,-85),
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

}
