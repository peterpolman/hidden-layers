import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseItem from '@/components/BaseItem.vue';

@Component({
    name: 'BaseInventory',
    components: {
        'base-item': BaseItem,
    },
    computed: {
        ...mapGetters('inventory', {
            inventory: 'items',
        }),
    },
})
export default class BaseInventory extends Vue {}
