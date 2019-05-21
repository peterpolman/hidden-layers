export default class GeoService {
    constructor() {
        this.options = {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 30000
        }
    }

    getPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(function(r) {
                const position = {
                    lat: r.coords.latitude,
                    lng: r.coords.longitude
                }
                resolve(position);
            }, (err) => {
                reject(err);
            }, this.options);
        })
    }
}
