import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { Item } from '@/models/Item';
import { BButton, BPopover } from 'bootstrap-vue';

const ImgItems = {
    potion: require('../assets/img/potion.png'),
    map: require('../assets/img/map.png'),
    ward: require('../assets/img/ward-1.png'),
    woodSword: require('../assets/img/woodSword.png'),
    gold: require('../assets/img/coin.png'),
    coinStack: require('../assets/img/coinstack.png'),
    backpack: require('../assets/img/backpack.png'),
    backpackOpen: require('../assets/img/backpack_open.png'),
};

@Component({
    name: 'BaseInventory',
    components: {
        'b-button': BButton,
        'b-popover': BPopover,
    },
    computed: {
        ...mapGetters('inventory', {
            inventory: 'items',
        }),
    },
})
export default class BaseInventory extends Vue {
    @Prop() item!: Item;

    img = ImgItems;
}
