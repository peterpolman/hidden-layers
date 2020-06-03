import { Vue, Component } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BButton } from 'bootstrap-vue';

import { User } from '@/models/User';
import { Goblin } from '@/models/Enemies';
import { Loot } from '@/models/Loot';
import { Account } from '@/models/Account';

import BaseFog from '@/components/BaseFog.vue';
import BaseMap from '@/components/BaseMap.vue';
import BaseAction from '@/components/BaseAction.vue';
import BaseProfile from '@/components/BaseProfile.vue';
import BaseInventory from '@/components/BaseInventory.vue';
import BaseUser from '@/components/characters/User.vue';
import BaseGoblin from '@/components/characters/Goblin.vue';
import BaseLoot from '@/components/BaseLoot';

@Component({
    name: 'home',
    components: {
        'b-button': BButton,
        'base-map': BaseMap,
        'base-profile': BaseProfile,
        'base-action': BaseAction,
        'base-inventory': BaseInventory,
        'human': BaseUser,
        'goblin': BaseGoblin,
        'loot': BaseLoot,
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
    account!: Account;
    map!: any;
    tb!: any;
    all!: { [id: string]: Goblin | User | Loot };
    selected!: Goblin | User;

    onMapClick(event: any) {
        const intersect = this.tb.queryRenderedFeatures(event.point)[0];

        if (intersect) {
            this.handleMeshClick(intersect.object);
        } else {
            this.handleMapClick();
        }
    }

    handleMeshClick(object: any) {
        if (object.name !== 'fog') {
            const data = this.getUserData(object).userData;

            this.$store.commit('markers/select', data.id);
        }
    }

    handleMapClick() {
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

    async toggleLockCamera() {
        await this.$store.dispatch('account/toggleLockCamera');
        this.map.dragPan[this.account.lockCamera ? 'disable' : 'enable']();
        this.map.setCenter([this.account.position.lng, this.account.position.lat]);
    }

    logout() {
        this.$router.replace('logout');
    }
}
