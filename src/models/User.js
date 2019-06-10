const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

import firebase from 'firebase/app';
import DamagableCharacter from './DamagableCharacter';

export default class User extends DamagableCharacter {
    constructor (id, data) {
        super(id, data);

        this.ref = firebase.database().ref('users2').child(id);
        this.slug = 'user';
        this.xp = data.exp;
        this.name = data.username;
        this.class = data.userClass;
        this.avatar = data.userClass;
        this.stats = data.stats;
        this.scout = data.scout;
        this.marker = null;

        this.loadInfo(this.getInfoMarkup());
    }

    getInfoMarkup() {
        let el = document.createElement('div');

        el.style = {position: 'relative'};
        el.classList.add(`marker-${this.id}`);
        el.innerHTML = `
            <div class="character-wrapper">
                <div class="character-level">
                    ${this.xp}
                </div>
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

    onClick() {
        alert(`Hi ${this.name}!`);
    }
}
