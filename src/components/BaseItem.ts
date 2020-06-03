import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { Item } from '@/models/Item';
import { Account } from '@/models/Account';
import { Images } from '@/models/Images';
import { BButton, BPopover } from 'bootstrap-vue';

@Component({
    name: 'BaseInventory',
    components: {
        'b-button': BButton,
        'b-popover': BPopover,
    },
    computed: {
        ...mapGetters('account', {
            account: 'account',
        }),
        ...mapGetters('inventory', {
            inventory: 'items',
        }),
    },
})
export default class BaseInventory extends Vue {
    @Prop() item!: Item;
    @Prop() equipped!: boolean;
    @Prop() dropable!: boolean;

    account!: Account;
    img: Images = new Images();

    equip() {
        this.$store.dispatch('inventory/equip', { account: this.account, item: this.item });
    }

    unequip() {
        this.$store.dispatch('inventory/unequip', { account: this.account, item: this.item });
    }

    drop() {
        this.$store.dispatch('inventory/drop', { account: this.account, item: this.item });
    }
}
