import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BButton, BSpinner, BListGroup, BListGroupItem, BProgress, BProgressBar } from 'bootstrap-vue';
import { Account } from '@/models/Account';

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
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
    },
    computed: {
        ...mapGetters('map', {
            map: 'map',
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
    }
}
