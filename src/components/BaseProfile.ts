import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BButton, BSpinner, BProgress, BProgressBar } from 'bootstrap-vue';
import { Account } from '@/models/Account';
import BaseEquipment from '@/components/BaseEquipment.vue';

const ImgAccountClass = {
    wizard: require('../assets/img/wizard-1.png'),
    knight: require('../assets/img/knight-1.png'),
    archer: require('../assets/img/archer-1.png'),
};

@Component({
    name: 'BaseProfile',
    components: {
        'b-spinner': BSpinner,
        'b-button': BButton,
        'b-progress': BProgress,
        'b-progress-bar': BProgressBar,
        'base-equipment': BaseEquipment,
    },
    computed: {
        ...mapGetters('map', {
            map: 'map',
            miniMap: 'miniMap',
        }),
        ...mapGetters('account', {
            account: 'account',
        }),
    },
})
export default class BaseProfile extends Vue {
    account!: Account;
    map!: any;
    imgAccountClass = ImgAccountClass;

    onProfileClick() {
        this.map.setCenter([this.account.position.lng, this.account.position.lat]);
        this.$bvModal.show('equipment');
    }
}
