const THREE = window.THREE;
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
        this.indicator = null;

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

    travelTo(options, destination) {
        const HL = window.HL;
        const path = new THREE.CatmullRomCurve3(this.tb.utils.lnglatsToWorld(options.path))
        let position = 0;

        clearInterval(this.timer);
        this.moveIndicator(destination);

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
                HL.selected = null;
                this.world.remove(this.indicator);
                this.tb.repaint();
                clearInterval(this.timer);
            }
        }, 100)
    }

    onMapClickWhenSelected(e) {
        this.setDestination(e);
    }

    moveIndicator(lngLat) {
        this.indicator.setCoords(lngLat);
        this.indicator.position.z = -0.05;
    }

    onClick() {
        const HL = window.HL;
        const lngLat = [this.position.lng, this.position.lat];
        let geometry = new THREE.CylinderGeometry( 2, 2, .03, 16 );
        let material = new THREE.MeshLambertMaterial({color: 0x0000FF, transparent: true, opacity: 0.25, side: THREE.DoubleSide});
        let cylinder = new THREE.Mesh( geometry, material );

        this.world.remove(this.indicator);

        this.indicator = this.tb.Object3D({obj: cylinder, units:'meters', scale: 1})
        this.indicator.rotateX(THREE.Math.degToRad(90));
        this.moveIndicator(lngLat);

        this.tb.add(this.indicator);
        this.tb.repaint();

        HL.selected = this;

        console.log('Selected scout', this.name);
    }

}
