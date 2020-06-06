import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import MapboxGL from 'mapbox-gl';
import firebase from '@/firebase';
import Geohash from 'latlon-geohash';
import { Ward } from '@/models/ward';

const MapStyle = function () {
    const hours = new Date().getHours();
    const isDayTime = hours > 7 && hours < 19;

    return isDayTime ? require('../../assets/style.json') : require('../../assets/style-dark.json');
};

export interface MapModuleState {
    map: any;
    miniMap: any;
    tb: any;
    mixers: any[];
}

@Module({ namespaced: true })
class MapModule extends VuexModule implements MapModuleState {
    private _tb: any = null;
    private _mixers: any = [];
    private _map: any = null;
    private _miniMap: any = null;

    get tb() {
        return this._tb;
    }

    get map() {
        return this._map;
    }

    get miniMap() {
        return this._miniMap;
    }

    get mixers() {
        return this._mixers;
    }

    @Mutation
    public setMap(options: any) {
        this._map = new MapboxGL.Map(options);
    }

    @Mutation
    public remove() {
        this._map.remove();
        this._map = null;
        this._tb = null;
    }

    @Mutation
    public addMixer(mixer: any) {
        this._mixers.push(mixer);
    }

    @Mutation
    public addLayer(layer: any) {
        const layers = this._map.getStyle().layers;

        this._map.addLayer(layer, layers[layers.length - 1].id);
    }

    @Mutation
    public addThreebox(tb: any) {
        this._tb = tb;
    }

    @Mutation
    public setMiniMap(payload: { container: HTMLElement; position: any }) {
        this._miniMap = new MapboxGL.Map({
            container: payload.container,
            style: MapStyle(),
            zoom: 10,
            maxZoom: 16,
            minZoom: 10,
            center: [payload.position.lng, payload.position.lat],
            antialias: true,
            doubleClickZoom: false,
            pitchWithRotate: false,
            touchZoomRotate: false,
            scrollZoom: false,
            boxZoom: false,
            dragRotate: false,
            dragPan: false,
        });
    }

    @Action
    public async addWard(payload: { account: Account; position: { lat: number; lng: number } }) {
        const snap = await firebase.db.ref(`wards`).push();
        const hash = Geohash.encode(payload.position.lat, payload.position.lng, 7);

        await firebase.db.ref(`wards/${snap.key}`).set({
            id: snap.key,
            position: payload.position,
            owner: payload.account.id,
        });

        await firebase.db.ref(`markers/${hash}/${snap.key}`).set({
            position: payload.position,
            ref: `wards/${snap.key}`,
        });
    }

    @Action
    public async removeWard(payload: { account: Account; marker: Ward }) {
        const hash = Geohash.encode(payload.marker.position.lat, payload.marker.position.lng, 7);

        await firebase.db.ref(`markers/${hash}/${payload.marker.id}`).remove();
        await firebase.db.ref(`wards/${payload.marker.id}`).remove();
    }

    @Action
    public async init(payload: { container: HTMLElement; position: any }) {
        this.context.commit('setMap', {
            container: payload.container,
            style: MapStyle(),
            zoom: 19,
            maxZoom: 21,
            minZoom: 18,
            center: [payload.position.lng, payload.position.lat],
            pitch: 75,
            bearing: 45,
            antialias: true,
            doubleClickZoom: false,
            pitchWithRotate: false,
            touchZoomRotate: { around: 'center' },
            scrollZoom: { around: 'center' },
            boxZoom: false,
            dragRotate: true,
        });
    }
}

export default MapModule;
