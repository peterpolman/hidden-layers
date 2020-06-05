import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BButton } from 'bootstrap-vue';
import { User } from '@/models/User';
import { Goblin } from '@/models/Enemies';
import { Images } from '@/models/Images';
import { Item } from '@/models/Item';

@Component({
    name: 'BaseAction',
    components: {
        'b-button': BButton,
    },
    computed: {
        ...mapGetters('account', {
            account: 'account',
        }),
        ...mapGetters('equipment', {
            equipment: 'equipment',
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

    onMainClick() {
        this.main.activate();
        this.$store.commit('equipment/activate', this.main);
    }

    onOffClick() {
        this.main.activate();
        this.$store.commit('equipment/activate', this.off);
    }
}
