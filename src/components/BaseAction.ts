import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BProgress, BButton } from 'bootstrap-vue';
import { User } from '@/models/User';
import { Goblin } from '@/models/Enemies';
import { Images } from '@/models/Images';
import { Item, Weapon, Consumable } from '@/models/Item';
import firebase from '@/firebase';

@Component({
    name: 'BaseAction',
    components: {
        'b-button': BButton,
        'b-progress': BProgress,
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
    time = 0;
    actionTimer: any;

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

    async attack(weapon: Weapon, target: any) {
        const die = async (t: any) => {
            await this.$store.dispatch('markers/remove', target);
            await t.ref.remove();
        };
        const dropLoot = async (t: any) => {
            const snap = await firebase.db.ref(`items`).once('value');
            const keys = Object.keys(snap.val());
            const index = Math.floor(Math.random() * keys.length);

            // Always drop some coin
            await this.$store.dispatch('inventory/place', {
                position: t.position,
                item: new Item({
                    amount: Math.floor(Math.random() * 20) + 5,
                    id: '-M8fjDoqeLMlz6xGrM-C',
                }),
            });

            // Drop rate item 25%
            if (Math.random() < 0.25) {
                await this.$store.dispatch('inventory/place', {
                    position: t.position,
                    item: new Item({
                        amount: 1,
                        id: keys[index],
                    }),
                });
            }
        };

        if (target.ref) {
            this.attacking = true;
            this.actionTimer = window.setInterval(async () => {
                this.time += weapon.speed / 100;

                if (this.time >= weapon.speed) {
                    const damage = weapon.damage + Math.floor(Math.random() * 10);
                    const hp = target.hitPoints - damage;

                    window.clearInterval(this.actionTimer);

                    if (hp < 0) {
                        this.$store.commit('markers/deselect');

                        dropLoot(target);
                        die(target);
                    } else {
                        await target.ref.update({ hitPoints: hp });
                    }
                    this.attacking = false;
                    this.time = 0;
                }
            }, 1);
        }
    }

    consume(item: Consumable, target: any) {
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
