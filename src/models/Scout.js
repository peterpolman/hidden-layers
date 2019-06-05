const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
import DamagableCharacter from './DamagableCharacter';
import config from '../config.js';

export default class Scout extends DamagableCharacter {
    constructor (id, data) {
        super(id, data);

        this.name = 'Scout';
        this.avatar = 'wolf';

        this.marker = null;
        const markup = this.getInfoMarkup();
        this.loadInfo(markup);
    }

    getInfoMarkup() {
        let el = document.createElement('div');
        el.style = {position: 'relative'};
        el.classList.add(`marker-${this.id}`);
        el.innerHTML = `
            <div class="character-wrapper">
                <div class="character-info">
                    <strong class="character-name">${this.name}</strong><br>
                    ${this.hitPointsMarkup}
                </div>
            </div>`;

        return el;
    }

    loadInfo(markup) {
        const MAP = window.MAP;

        if (this.marker === null) {
            this.marker = new mapboxgl.Marker({
                    element: markup,
                    offset: [30,40]
                })
                .setLngLat([this.position.lng, this.position.lat])
                .addTo(MAP);
        }
    }

    fetchFunction(url, cb) {
       fetch(url)
           .then(
               function(response){
                   if (response.status === 200) {
                       response.json()
                           .then(function(data){
                               cb(data)
                           })
                   }
               }
           )
    }

    setDestination(e) {
        const origin = [this.position.lng, this.position.lat];
        const destination = [e.lngLat.lng, e.lngLat.lat];
        const url = "https://api.mapbox.com/directions/v5/mapbox/walking/"+[origin, destination].join(';')+"?geometries=geojson&access_token=" + config.mapbox.key;
        const callback = (data) => {
            const options = {
                path: data.routes[0].geometry.coordinates,
                duration: data.routes[0].duration * 60
            }
            this.travelTo(options);
        }

        this.fetchFunction(url, callback);
    }

    travelTo(options) {
        this.walking = true;
        this.followPath(options);
    }

    followPath(options) {
        const THREE = window.THREE;
        var position = 0;
        var path = new THREE.CatmullRomCurve3(this.tb.utils.lnglatsToWorld(options.path))

        clearInterval(this.timer);
        this.timer = setInterval(() => {
            position += 0.01;
            if (position <= 1) {
                var point = path.getPointAt(position);
                var lngLat = this.tb.utils.unprojectFromWorld(point);
                this.ref.update({
                    position: {
                        lng: lngLat[0],
                        lat: lngLat[1]
                    }
                });
            }
            else {
                this.walking = false;
                clearInterval(this.timer);
            }
        }, 500)
    }

    onClick() {
        alert(`Hi scout ${this.name}!`);
    }

}
