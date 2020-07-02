import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseItem from '@/components/BaseItem.vue';
import BaseModal from '@/components/BaseModal.vue';
import draggable from 'vuedraggable';
import { Item } from '@/models/Item';
import { Account } from '@/models/Account';

@Component({
    name: 'BaseEquipment',
    components: {
        'base-item': BaseItem,
        'base-modal': BaseModal,
        'draggable': draggable,
    },
    computed: {
        ...mapGetters('account', {
            account: 'account',
        }),
        ...mapGetters('inventory', {
            items: 'items',
        }),
        ...mapGetters('equipment', {
            equipment: 'equipment',
        }),
    },
})
export default class BaseEquipment extends Vue {
    isOpen = false;
    items!: Item[];
    account!: Account;

    open() {
        this.isOpen = !this.isOpen;
        this.$bvModal.show('inventory');
    }
}
