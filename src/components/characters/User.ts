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
            map: 'map',
        }),
    },
})
export default class CharacterUser extends Vue {
    @Prop() marker!: User;

    img = ImgAccountClass;
    miniMap: any;
    miniMapIcon: any;
    map: any;

    impactMarkers: any = {};
    impactTimers: any = {};

    mounted() {
        const el = document.createElement('div');
        el.className = 'minimap-user';

        this.miniMapIcon = new MapboxGL.Marker(el)
            .setLngLat([this.marker.position.lng, this.marker.position.lat])
            .addTo(this.miniMap);

        this.$watch('marker.experiencePoints', (newXP: number, oldXP: number) => {
            this.updateExperiencepoints(newXP, oldXP);
        });

        this.$watch('marker.level', (newLVL: number, oldLVL: number) => {
            this.updateLevel(newLVL, oldLVL);
        });
    }

    updateLevel(newLvl: number, oldLvl: number) {
        const propValue = `${newLvl - oldLvl} Level up!`;

        this.showImpact(propValue, 'lvl');
    }

    updateExperiencepoints(newXP: number, oldXP: number) {
        const propValue = `XP: +${newXP - oldXP}`;

        this.showImpact(propValue, 'xp');
    }

    showImpact(value: string, type: string) {
        const el = document.createElement('div');

        el.classList.add(type);
        el.classList.add('character-hit');
        el.innerText = value;

        if (this.impactMarkers[type]) {
            this.impactMarkers[type].remove();
        }

        this.impactMarkers[type] = new MapboxGL.Marker(el)
            .setLngLat([this.marker.position.lng, this.marker.position.lat])
            .addTo(this.map);

        this.impactTimers[type] = window.setTimeout(() => {
            this.impactMarkers[type].remove();
            window.clearTimeout(this.impactTimers[type]);
        }, 300);
    }

    updatePosition(position: any) {
        this.miniMapIcon.setLngLat([position.lng, position.lat]);
    }

    destroyed() {
        this.miniMapIcon.remove();
    }
}
