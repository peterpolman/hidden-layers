import { mapGetters } from 'vuex';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { User } from '@/models/User';
import BaseCharacter from '@/components/BaseCharacter.vue';
import { BProgress } from 'bootstrap-vue';
import MapboxGL from 'mapbox-gl';

const ImgAccountClass = {
    wizard: require('../../assets/img/wizard-1.png'),
    knight: require('../../assets/img/knight-1.png'),
    archer: require('../../assets/img/archer-1.png'),
};

@Component({
    name: 'User',
    components: {
        'base-character': BaseCharacter,
        'b-progress': BProgress,
    },
    computed: {
        ...mapGetters('inventory', {
            inventory: 'items',
        }),
        ...mapGetters('map', {
            miniMap: 'miniMap',
        }),
    },
})
export default class CharacterUser extends Vue {
    @Prop() marker!: User;

    img = ImgAccountClass;
    miniMap: any;
    icon: any;

    mounted() {
        const el = document.createElement('div');
        el.className = 'marker-user';

        this.icon = new MapboxGL.Marker(el)
            .setLngLat([this.marker.position.lng, this.marker.position.lat])
            .addTo(this.miniMap);
    }

    updatePosition(position: any) {
        this.icon.setLngLat([position.lng, position.lat]);
    }

    destroyed() {
        this.icon.remove();
    }
}
