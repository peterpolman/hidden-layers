const THREE = window.THREE;

import firebase from 'firebase/app';
import MarkerService from './services/MarkerService';
import SpawnService from './services/SpawnService';
import EventService from './services/EventService';
import Item from './models/Item';
import Fog from './Fog';

export default class HiddenLayer {
    constructor() {
        const MAP = window.MAP;

        this.uid = firebase.auth().currentUser.uid;

        this.markerService = new MarkerService();
        this.spawnService = new SpawnService();
        this.ea = new EventService();
        this.geoService = null;

        this.user = null;
        this.scout = null;
        this.wards = [];

        this.markers = [];
        this.active = false;
        this.tb = null;
        this.fog = null;

        this.selectedItem = null;
        this.selectedTarget = null;

        const layers = MAP.getStyle().layers;
        const layer = {
            id: 'custom_layer',
            type: 'custom',
            renderingMode: '3d',
            onAdd: function(map, mbxContext){
                const Threebox = window.Threebox;
                const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.65);
                const ambientLightLight = new THREE.AmbientLight(0xFFFFFF, 1);

                this.tb = new Threebox(
                    map,
                    mbxContext,
                    {defaultLights: false}
                );

                this.tb.add(directionalLight);
                this.tb.add(ambientLightLight);

                const ne = this.tb.utils.projectToWorld([180, 85]);
                const sw = this.tb.utils.projectToWorld([-180, -85]);

                this.fog = new Fog(this.tb, ne, sw, 5);

                MAP.on('click', (e) => this.onClick(e));
            }.bind(this),
            // eslint-disable-next-line
            render: function(gl, matrix){
                for (let id in this.markers) {
                    if (this.markers[id].mesh !== null) {
                        const u = this.user.mesh.position;
                        const s = this.scout.mesh.position;
                        const p = this.markers[id].mesh.position;
                        const dUser = this.distanceVector(u, p);
                        const dScout = this.distanceVector(s, p);
                        const visible = (dUser < 2 || dScout < 1.5)

                        this.markers[id].hide(visible);
                    }
                }
                this.tb.update();
            }.bind(this)
        }
        // Add to layer array before buildings.
        MAP.addLayer(layer, layers[layers.length-1].id);
    }

    distanceVector( v1, v2 ) {
        var dx = v1.x - v2.x;
        var dy = v1.y - v2.y;
        var dz = v1.z - v2.z;

        return Math.sqrt( dx * dx + dy * dy + dz * dz );
    }

    onClick(e) {
        // calculate objects intersecting the picking ray
        var intersect = this.tb.queryRenderedFeatures(e.point)[0]
        var intersectionExists = typeof intersect == "object"

        // if intersect exists, highlight it
        if (intersect && intersect.object.name !== this.fog.fog.name) {
            var object = intersect.object;
            this.handleObjectClick(e, object);
        }
        else {
            this.handleMapClick(e);
        }

        // on state change, fire a repaint
        if (this.active !== intersectionExists) {
            this.active = intersectionExists;
            this.tb.repaint();
        }
    }

    selectTarget(id) {
        const data = { id: id };
        return  this.ea.dispatch('target.click', data)
    }

    selectItem(slug) {
        const data = { slug: slug };
        return this.ea.dispatch('selected.click', data)
    }

    handleObjectClick(e, object) {
        const HL = window.HL;
        const target = object.parent.parent;
        const id = target.userData.id;

        if (this.user.id === id) {
            this.user.onClick();
        }
        else if (this.scout.id === id) {
            this.selectedTarget = this.scout;
            this.scout.onClick();
        }
        else if (typeof HL.markers[id].amount == 'undefined') {
            this.selectTarget(id);
            this.selectedTarget = HL.markers[id];

            HL.markers[id].onClick();
        }
        else if (HL.markers[id].amount > 0) {
            this.reset();

            HL.markers[id].pickup();
        }

        console.log('Object click at ', object);
    }

    reset() {
        this.selectTarget(null);
        this.selectedTarget = null;

        this.selectItem(null);
        this.selectedItem = null;
    }

    handleMapClick(e) {
        if (this.selectedItem !== null) {
            this.selectedItem = new Item(this.selectedItem.id, this.selectedItem);
            this.selectedItem.drop(e.lngLat);
            this.selectedItem.removeFromInventory();
        }

        if (this.selectedTarget && this.selectedTarget.id == this.scout.id) {
            this.selectedTarget.onMapClickWhenSelected(e);
        }

        this.reset();

        console.log('Map click at', e);
    }

}
