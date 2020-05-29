import { Vue, Component } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

import BaseMap from '@/components/BaseMap.vue';
import BaseProfile from '@/components/BaseProfile.vue';
import BaseInventory from '@/components/BaseInventory.vue';
import BaseUser from '@/components/BaseUser.vue';

@Component({
    name: 'home',
    components: {
        'base-map': BaseMap,
        'base-profile': BaseProfile,
        'base-inventory': BaseInventory,
        'base-user': BaseUser,
    },
    computed: {
        ...mapGetters('map', {
            map: 'map',
            tb: 'tb',
        }),
        ...mapGetters('users', {
            users: 'users',
        }),
    },
})
export default class Home extends Vue {
    map!: any;
    tb!: any;

    onMapClick(event: any) {
        const intersect = this.tb.queryRenderedFeatures(event.point)[0];

        if (intersect) {
            this.handleMeshClick(event, intersect.object);
        } else {
            this.handleMapClick(event);
        }
    }

    handleMeshClick(event: any, object: any) {
        debugger;
    }

    handleMapClick(event: any) {
        debugger;
    }
}
