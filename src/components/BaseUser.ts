import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BButton } from 'bootstrap-vue';
import { User } from '@/models/User';
import MapboxGL from 'mapbox-gl';

const ImgAccountClass = {
    wizard: require('../assets/img/wizard-1.png'),
    knight: require('../assets/img/knight-1.png'),
    archer: require('../assets/img/archer-1.png'),
};

@Component({
    name: 'BaseUser',
    components: {
        'b-button': BButton,
    },
    computed: {
        ...mapGetters('inventory', {
            inventory: 'items',
        }),
    },
})
export default class BaseUser extends Vue {
    @Prop() user!: User;
    @Prop() map!: any;

    img = ImgAccountClass;
    marker: any;

    mounted() {
        const lngLat = [this.user.position.lng, this.user.position.lat];
        const el = document.createElement('div');

        el.className = 'marker';
        this.marker = new MapboxGL.Marker(el).setLngLat(lngLat).addTo(this.map);
    }
}
