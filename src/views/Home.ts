import { Vue, Component } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

import { User } from '@/models/User';
import { Goblin } from '@/models/Enemies';

import BaseFog from '@/components/BaseFog.vue';
import BaseMap from '@/components/BaseMap.vue';
import BaseAction from '@/components/BaseAction.vue';
import BaseProfile from '@/components/BaseProfile.vue';
import BaseInventory from '@/components/BaseInventory.vue';
import BaseUser from '@/components/characters/User.vue';
import BaseGoblin from '@/components/characters/Goblin.vue';

@Component({
    name: 'home',
    components: {
        'base-map': BaseMap,
        'base-profile': BaseProfile,
        'base-action': BaseAction,
        'base-inventory': BaseInventory,
        'human': BaseUser,
        'goblin': BaseGoblin,
        'base-fog': BaseFog,
    },
    computed: {
        ...mapGetters('map', {
            map: 'map',
            tb: 'tb',
        }),
        ...mapGetters('markers', {
            all: 'all',
            selected: 'selected',
        }),
        ...mapGetters('equipment', {
            equipment: 'equipment',
        }),
        ...mapGetters('account', {
            account: 'account',
        }),
    },
})
export default class Home extends Vue {
    map!: any;
    tb!: any;
    all!: { [id: string]: Goblin | User };
    selected!: Goblin | User;

    onMapClick(event: any) {
        const intersect = this.tb.queryRenderedFeatures(event.point)[0];

        if (intersect) {
            this.handleMeshClick(event, intersect.object);
        } else {
            this.handleMapClick(event);
        }
    }

    handleMeshClick(event: any, object: any) {
        const data = this.getUserData(object).userData;
        console.log(event);
        this.$store.dispatch('markers/select', data.id);
    }

    handleMapClick(event: any) {
        console.log(event);
        this.$store.dispatch('markers/deselect');
    }

    getUserData(object: any) {
        if (typeof object.userData.id != 'undefined') {
            return object;
        } else if (typeof object.parent.userData.id != 'undefined') {
            return object.parent;
        } else if (typeof object.parent.parent.userData.id != 'undefined') {
            return object.parent.parent;
        } else if (typeof object.parent.parent.parent.userData.id != 'undefined') {
            return object.parent.parent.parent;
        }
    }
}
