const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
import DamagableCharacter from './DamagableCharacter';
import config from '../config.js';

export default class Scout extends DamagableCharacter {
    constructor (id, data) {
        super(id, data);

        this.uid = data.uid;
        this.name = data.name;
        this.avatar = 'wolf';
        this.marker = null;
        this.destination = null;

        this.loadInfo();
    }

    loadInfo() {
        const MAP = window.MAP;
        let markup = document.createElement('div');
        markup.classList.add(`marker-${this.id}`);
        markup.innerHTML = `
            <div class="character-wrapper">
                <div class="character-info">
                    <strong class="character-name">${this.name}</strong><br>
                    ${this.hitPointsMarkup}
                </div>
            </div>`;

        this.marker = new mapboxgl.Marker({
            element: markup,
            offset: [30,40]
        })
        .setLngLat([this.position.lng, this.position.lat])
        .addTo(MAP);
    }

    setDestination(e) {
        const origin = [this.position.lng, this.position.lat];
        const destination = [e.lngLat.lng, e.lngLat.lat];
        const url = "https://api.mapbox.com/directions/v5/mapbox/walking/"+[origin, destination].join(';')+"?geometries=geojson&access_token=" + config.mapbox.key;

        return fetch(url).then((response) => {
            if (response.status === 200) {
                response.json().then((data) => {
                    const options = {
                        path: data.routes[0].geometry.coordinates,
                        duration: data.routes[0].duration * 60
                    }
                    this.travelTo(options, destination);
                })
            }
        });
    }

    setTarget(lngLat) {
        const THREE = window.THREE;
        const geometry = new THREE.SphereGeometry(.5, 16, 16);
        const material = new THREE.MeshPhongMaterial( {color: 0xFF0000} );
        const cube = new THREE.Mesh( geometry, material );

        this.destination = this.tb.Object3D({obj: cube, units:'meters', scale: 1 }).setCoords(lngLat);

        this.tb.add(this.destination);
        this.tb.repaint();
    }

    travelTo(options, destination) {
        const THREE = window.THREE;
        const path = new THREE.CatmullRomCurve3(this.tb.utils.lnglatsToWorld(options.path))
        let position = 0;

        clearInterval(this.timer);
        this.world.remove(this.destination);
        this.setTarget(destination);
        this.timer = setInterval(() => {
            position += 0.01;
            if (position < 1) {
                const point = path.getPointAt(position);
                const lngLat = this.tb.utils.unprojectFromWorld(point);
                this.ref.update({
                    position: {
                        lng: lngLat[0],
                        lat: lngLat[1]
                    }
                });
            }
            else {
                this.world.remove(this.destination);
                clearInterval(this.timer);
            }
        }, 100)
    }

    onClick() {
        alert(`Hi ${this.name}`);
    }

}
