export default class Item {
    constructor(uid, data) {
        this.uid = uid
        this.name = name
        this.slug = slug
        this.amount = amount
        this.size = size
        this.icons = {
            tools: require('../assets/img/tools.png'),
            gold: require('../assets/img/coinstack.png'),
            ward: require('../assets/img/ward-1.png'),
            discover: require('../assets/img/discover.png'),
            sword: require('../assets/img/woodSword.png'),
            potion: require('../assets/img/potion.png'),
        }
        this.marker = new google.maps.Marker({
            id: id,
            position: position,
            icon: {
                url: this.icons[slug],
                size: new google.maps.Size(size, size),
                scaledSize: new google.maps.Size(size, size),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(size / 2, (size / 2) + 15)
            }
        })

        this.setVisible(false)
    }

    set(key, value) {
        this[key] = value
    }

    get(key) {
        return this[key]
    }

    setPosition(position) {
        this.marker.setPosition(new google.maps.LatLng(position.lat, position.lng))
    }

    setVisible(visibility) {
        this.marker.setVisible(visibility)
    }

}
