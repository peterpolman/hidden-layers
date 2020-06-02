import { Component, Prop, Vue } from 'vue-property-decorator';
import { BModal, BOverlay, BButton } from 'bootstrap-vue';

@Component({
    name: 'BaseModal',
    components: {
        'b-button': BButton,
        'b-overlay': BOverlay,
        'b-modal': BModal,
    },
})
export default class BaseModal extends Vue {
    @Prop() private id!: string;
    @Prop() private title!: string;
    @Prop() private loading!: boolean;

    close() {
        this.$bvModal.hide(this.id);
    }
}
