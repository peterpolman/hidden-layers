const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
import Character from './Character';

export default class User extends Character {
    constructor (id, data) {
        super(id, data);

        this.xp = data.exp;
        this.userName = data.username;
        this.userClass = data.userClass;
        this.stats = data.stats;
        this.hitPoints = (data.hitPoints < 0) ? 0 : data.hitPoints
        this.marker = null;
        this.loadInfo();
    }

    loadInfo() {
        const MAP = window.MAP;
        const color = (this.hitPoints > 50 ) ? '#8CC63E' : (this.hitPoints > 25) ? '#FFBB33' : '#ED1C24';

        let el = document.createElement('div');
        el.style = {position: 'relative'};
        el.classList.add(`marker-${this.id}`);

        // TODO Create styles for this:)
        el.innerHTML = `
            <div class="user-wrapper">
                <div class="user-picture user-picture-s">
                    <img src="./img/${this.userClass}-1.png" alt="" />
                </div>
                <div class="user-info">
                    <strong class="user-name">${this.userName}</strong><br>
                    <div class="bar-wrapper user-hp">
                        <div class="bar" style="background-color: ${color}; width: ${this.hitPoints}px;"></div>
                    </div>
                </div>
            </div>`;

        if (this.marker === null) {
            this.marker = new mapboxgl.Marker({
                    element: el,
                    offset: [30,40]
                })
                .setLngLat([this.position.lng, this.position.lat])
                .addTo(MAP);
        }


    }

    onClick() {
        alert(`Hi ${this.userName}!`);
    }
}
