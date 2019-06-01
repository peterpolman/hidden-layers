const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

import firebase from 'firebase/app';
import Character from './Character';

export default class User extends Character {
    constructor (id, data) {
        super(id, data);

        this.type = 'human';
        this.exp = data.exp;
        this.userName = data.username;
        this.userClass = data.userClass;
        this.stats = data.stats;
        this.position = data.position;
        this.hitPoints = (data.hitPoints < 0) ? 0 : data.hitPoints
        this.ref = firebase.database().ref(`users2/${id}`);
        this.loadInfo();
        this.loadAtPosition(id, this.type, data.position);
        this.watch();
    }

    loadInfo() {
        const MAP = window.MAP;
        const color = (this.hitPoints > 50 ) ? '#8CC63E' : (this.hitPoints > 25) ? '#FFBB33' : '#ED1C24';
        let el = document.createElement('div');
        el.style = {position: 'relative'};
        el.innerHTML = `
            <div style="box-shadow: 1px 1px rgba(0,0,0,.35); position: absolute; width: 30px; padding: 5px; height: 30px; border-radius: 5px; text-align: center; background-color: white; margin-left: -47px; margin-top: -2px">
                <img width="auto" height="30" src="./img/${this.userClass}-1.png" alt="" />
            </div>
            <strong style="color: white; text-shadow: 1px 1px rgba(0,0,0,.35);">${this.userName}</strong><br>
            <div style="box-shadow: 1px 1px rgba(0,0,0,.35); width: 100px; border: 2px solid white; border-radius: 2px;">
                <div style="height: 8px; background-color: ${color}; width: ${this.hitPoints}px;"></div>
            </div>`;
        this.marker = new mapboxgl.Marker(el)
            .setLngLat([this.position.lng, this.position.lat])
            .addTo(MAP);
    }

    onClick() {

    }
}
