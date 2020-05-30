import { Vue, Component } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

import { User } from '@/models/User';
import { Goblin } from '@/models/Enemies';

import BaseMap from '@/components/BaseMap.vue';
import BaseProfile from '@/components/BaseProfile.vue';
import BaseInventory from '@/components/BaseInventory.vue';
import BaseUser from '@/components/characters/User.vue';
import BaseGoblin from '@/components/characters/Goblin.vue';

@Component({
    name: 'home',
    components: {
        'base-map': BaseMap,
        'base-profile': BaseProfile,
        'base-inventory': BaseInventory,
        'human': BaseUser,
        'goblin': BaseGoblin,
    },
    computed: {
        ...mapGetters('map', {
            map: 'map',
            tb: 'tb',
        }),
        ...mapGetters('markers', {
            all: 'all',
            target: 'target',
            // users: 'users',
            // enemies: 'enemies',
        }),
    },
})
export default class Home extends Vue {
    map!: any;
    tb!: any;
    users!: { [id: string]: User };
    enemies!: { [id: string]: Goblin };

    onMapClick(event: any) {
        const intersect = this.tb.queryRenderedFeatures(event.point)[0];

        if (intersect) {
            this.handleMeshClick(event, intersect.object);
        } else {
            this.handleMapClick(event);
        }
    }

    handleMeshClick(event: any, object: any) {
        this.$store.dispatch('markers/setTarget', object.parent.parent.parent.userData.id);
        debugger;
    }

    handleMapClick(event: any) {
        debugger;
    }
}
