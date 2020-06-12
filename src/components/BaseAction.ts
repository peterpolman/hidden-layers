import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BButton } from 'bootstrap-vue';
import { User } from '@/models/User';
import { Goblin } from '@/models/Enemies';
import { Images } from '@/models/Images';
import { Item, Weapon, Consumable } from '@/models/Item';

@Component({
    name: 'BaseAction',
    components: {
        'b-button': BButton,
    },
    computed: {
        ...mapGetters('account', {
            account: 'account',
        }),
        ...mapGetters('markers', {
            selected: 'selected',
        }),
        ...mapGetters('equipment', {
            equipment: 'equipment',
            active: 'active',
        }),
        ...mapGetters('map', {
            map: 'map',
            tb: 'tb',
            mixers: 'mixers',
        }),
    },
})
export default class BaseAction extends Vue {
    @Prop() target!: Goblin | User;
    @Prop() main!: any | Item;
    @Prop() off!: any | Item;

    equipment!: { [slot: string]: Item };
    account!: Account;
    img: Images = new Images();
    selected: any;
    active!: any;
    combatTimer: any;
    attacking = false;
    consuming = false;

    onMainClick() {
        this.main.activate();
        this.$store.commit('equipment/activate', this.main);

        if (this.selected && !this.attacking && this.main.type === 'weapon') {
            this.attack(this.active, this.selected);
        }
    }

    onOffClick() {
        this.off.activate();
        this.$store.commit('equipment/activate', this.off);

        if (this.off.type === 'consumable') {
            this.consume(this.active, this.selected || this.account);
        }
    }

    attack(weapon: Weapon, target: any) {
        this.attacking = true;
        this.combatTimer = window.setTimeout(async () => {
            if (target.ref) {
                const damage = weapon.damage + Math.floor(Math.random() * 10);
                const hp = target.hitPoints - damage;
                if (hp > 0) {
                    await target.ref.update({ hitPoints: hp });
                } else {
                    this.$store.commit('markers/deselect');

                    await this.$store.dispatch('markers/remove', target);
                    await target.ref.remove();
                }
            }
            window.clearTimeout(this.combatTimer);
            this.attacking = false;
        }, weapon.speed);
    }

    async consume(item: Consumable, target: any) {
        this.consuming = true;
        this.combatTimer = window.setTimeout(async () => {
            if (target.ref) {
                const update = item.increase ? target[item.stat] + item.increase : target[item.stat] - item.decrease;

                await target.ref.child(item.stat).set(update);
            }
            window.clearTimeout(this.combatTimer);
            this.consuming = false;
        }, 1000);
    }
}
