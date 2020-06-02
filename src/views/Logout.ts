import { Vue, Component } from 'vue-property-decorator';
import { BSpinner } from 'bootstrap-vue';

@Component({
    name: 'logout',
    components: {
        'b-spinner': BSpinner,
    },
})
export default class Logout extends Vue {
    loading = false;

    async mounted() {
        this.loading = true;

        this.$store.commit('map/remove');
        await this.$store.dispatch('account/logout');

        this.loading = false;
    }
}
