const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
import DamagableCharacter from './DamagableCharacter';
import config from '../config.js';

export default class Scout extends DamagableCharacter {
    constructor (id, data) {
        super(id, data);

        this.name = `${HL.markers[data.uid].name}'s scout`;
        this.avatar = 'wolf';
        this.marker = null;
        this.destination = null;

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
                    this.setTarget(destination);
                    this.travelTo(options);
                })
            }
        });
    }

    setTarget(lngLat) {
        const THREE = window.THREE;
        const geometry = new THREE.SphereGeometry(.5, 16, 16);
        const material = new THREE.MeshPhongMaterial( {color: 0x0000FF} );
        const cube = new THREE.Mesh( geometry, material );

        this.destination = this.tb.Object3D({obj: cube, units:'meters', scale: 1 }).setCoords(lngLat);
        this.destination.name = 'destinationTarget';

        this.tb.add(this.destination);
        this.tb.repaint();
    }

    travelTo(options) {
        const THREE = window.THREE;
        var position = 0;
        var path = new THREE.CatmullRomCurve3(this.tb.utils.lnglatsToWorld(options.path))

        clearInterval(this.timer);
        this.walking = true;
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
                const objectInScene = this.world.getObjectByName('destinationTarget');
                this.world.remove(objectInScene);
                this.walking = false;
                clearInterval(this.timer);
            }
        }, 100)
    }

    onClick() {
        alert(`Hi ${this.name}!`);
    }

}
