import { Vue, Component } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BButton } from 'bootstrap-vue';
import Geohash from 'latlon-geohash';

import { User } from '@/models/User';
import { Item } from '@/models/Item';
import { Ward } from '@/models/Ward';
import { Goblin } from '@/models/Enemies';
import { Loot } from '@/models/Loot';
import { Account } from '@/models/Account';
import { Scout } from '@/models/Scout';

import BaseFog from '@/components/BaseFog.vue';
import BaseMap from '@/components/BaseMap.vue';
import BaseAction from '@/components/BaseAction.vue';
import BaseProfile from '@/components/BaseProfile.vue';
import BaseInventory from '@/components/BaseInventory.vue';
import BaseUser from '@/components/characters/User.vue';
import BaseScout from '@/components/characters/Scout.vue';
import BaseGoblin from '@/components/characters/Goblin.vue';
import BaseWard from '@/components/characters/Ward.vue';
import BaseLoot from '@/components/BaseLoot';

@Component({
    name: 'home',
    timers: {
        spawn: {
            time: 5000,
            repeat: true,
            autostart: true,
        },
    },
    components: {
        'b-button': BButton,
        'base-map': BaseMap,
        'base-profile': BaseProfile,
        'base-action': BaseAction,
        'base-inventory': BaseInventory,
        'human': BaseUser,
        'wolf': BaseScout,
        'goblin': BaseGoblin,
        'loot': BaseLoot,
        'ward': BaseWard,
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
            active: 'active',
        }),
        ...mapGetters('account', {
            account: 'account',
            scout: 'scout',
        }),
    },
})
export default class Home extends Vue {
    map!: any;
    tb!: any;
    all!: { [id: string]: Goblin | User | Loot | Scout | Ward };
    account!: Account;
    scout!: Scout;
    selected!: Goblin | User | Scout;
    active!: Item;

    spawn() {
        const randomPosition = (bounds: any) => {
            return {
                lat: bounds.sw.lat + Math.random() * (bounds.ne.lat - bounds.sw.lat),
                lng: bounds.sw.lon + Math.random() * (bounds.ne.lon - bounds.sw.lon),
            };
        };
        const positions = [this.account.position, this.scout.position];

        for (const i in positions) {
            // 10% change to spawn a goblin
            if (Math.random() < 0.1) {
                const hash = Geohash.encode(positions[i].lat, positions[i].lng, 7);
                const bounds = Geohash.bounds(hash);

                this.$store.dispatch('markers/spawnNpc', {
                    hash,
                    position: randomPosition(bounds),
                    race: 'goblin',
                    level: 3,
                });
            }
        }
    }

    onMapClick(event: any) {
        const intersect = this.tb.queryRenderedFeatures(event.point)[0];

        if (intersect) {
            this.handleMeshClick(intersect.object);
        } else {
            this.handleMapClick(event);
        }
    }

    handleMeshClick(object: any) {
        if (object.name !== 'fog') {
            const data = this.getUserData(object).userData;

            this.$store.commit('markers/select', data.id);
        }
    }

    async handleMapClick(e: any) {
        if (this.active) {
            switch (this.active.slug) {
                case 'ward':
                    await this.$store.dispatch('map/addWard', { account: this.account, position: e.lngLat });

                    this.$store.dispatch('inventory/unequip', {
                        account: this.account,
                        item: this.active,
                        destroy: true,
                    });
                    this.$store.commit('equipment/deactivate');
                    break;
            }
        }

        if (this.selected) {
            if (this.selected.race === 'wolf' && this.selected.id === this.account.scout) {
                this.$store.dispatch('account/moveScout', { from: this.selected.position, to: e.lngLat });
            }
        }

        this.$store.commit('markers/deselect');
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
