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
    public setMap(payload: { container: HTMLElement; center: any; bearing: number }) {
        this._map = new MapboxGL.Map({
            style: MapStyle(),
            zoom: 19,
            maxZoom: 21,
            minZoom: 18,
            pitch: 75,
            antialias: true,
            dragPan: true,
            doubleClickZoom: false,
            pitchWithRotate: false,
            touchZoomRotate: { around: 'center' },
            scrollZoom: { around: 'center' },
            boxZoom: false,
            ...payload,
        });
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
    public setMiniMap(payload: { container: HTMLElement; center: any; bearing: number }) {
        this._miniMap = new MapboxGL.Map({
            style: MapStyle(),
            zoom: 13,
            maxZoom: 16,
            minZoom: 10,
            antialias: false,
            doubleClickZoom: false,
            pitchWithRotate: false,
            touchZoomRotate: false,
            scrollZoom: false,
            boxZoom: false,
            dragRotate: false,
            dragPan: false,
            ...payload,
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
}

export default MapModule;
