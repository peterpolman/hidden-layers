import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import MapboxGL from 'mapbox-gl';

export interface MapModuleState {
    map: any;
    tb: any;
    mixers: any[];
}

@Module({ namespaced: true })
class MapModule extends VuexModule implements MapModuleState {
    private _tb: any = null;
    private _mixers: any = [];
    private _map: any = null;

    get tb() {
        return this._tb;
    }

    get map() {
        return this._map;
    }

    get mixers() {
        return this._mixers;
    }

    @Mutation
    public setMap(options: any) {
        this._map = new MapboxGL.Map(options);
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

    @Action
    public async init(payload: { container: HTMLElement; position: any }) {
        const hours = new Date().getHours();
        const isDayTime = hours > 7 && hours < 19;
        const style = isDayTime ? require('../../assets/style.json') : require('../../assets/style-dark.json');

        this.context.commit('setMap', {
            container: payload.container,
            style: style,

            zoom: 19,
            maxZoom: 21,
            minZoom: 16,
            center: [payload.position.lng, payload.position.lat],
            pitch: 75,
            bearing: 45,
            antialias: true,
            doubleClickZoom: false,
            pitchWithRotate: false,
            touchZoomRotate: false,
            scrollZoom: true,
            boxZoom: false,
            dragRotate: true,
        });
    }
}

export default MapModule;
