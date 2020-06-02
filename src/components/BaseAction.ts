import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BButton } from 'bootstrap-vue';
import { User } from '@/models/User';
import { Goblin } from '@/models/Enemies';
import { Equipment } from '@/store/modules/equipment';
import { Images } from '@/models/Images';
import { Item } from '@/models/Item';

@Component({
    name: 'BaseAction',
    components: {
        'b-button': BButton,
    },
    computed: {
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
export default class BaseCharacter extends Vue {
    @Prop() target!: Goblin | User;
    @Prop() main!: Item;
    @Prop() off!: Item;

    equipment!: Equipment;
    img: Images = new Images();

    onMainClick() {
        console.log(this.main);
        console.log(this.target);
        debugger;
    }

    onOffClick() {
        console.log(this.off);
        console.log(this.target);
        debugger;
    }
}
