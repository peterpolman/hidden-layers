import { Component, Vue, Prop } from 'vue-property-decorator';
import { Goblin } from '@/models/Enemies';
import BaseCharacter from '@/components/BaseCharacter.vue';
import { BProgress } from 'bootstrap-vue';
import MapboxGL from 'mapbox-gl';
import { mapGetters } from 'vuex';

const ImgGoblin = {
    goblin: require('../../assets/img/goblin-1.png'),
};

@Component({
    name: 'Goblin',
    components: {
        'base-character': BaseCharacter,
        'b-progress': BProgress,
    },
    computed: {
        ...mapGetters('map', {
            miniMap: 'miniMap',
        }),
    },
})
export default class CharacterUser extends Vue {
    @Prop() marker!: Goblin;

    img = ImgGoblin.goblin;
    miniMapIcon: any;
    miniMap: any;

    mounted() {
        const el = document.createElement('div');
        el.className = 'minimap-goblin';

        this.miniMapIcon = new MapboxGL.Marker(el)
            .setLngLat([this.marker.position.lng, this.marker.position.lat])
            .addTo(this.miniMap);
    }

    destroyed() {
        this.miniMapIcon.remove();
    }
}
