import { Vue, Component } from 'vue-property-decorator';
import { BButton, BSpinner } from 'bootstrap-vue';

@Component({
    name: 'login',
    components: {
        'b-button': BButton,
        'b-spinner': BSpinner,
    },
})
export default class Login extends Vue {
    email = '';
    password = '';
    loading = false;

    async login() {
        this.loading = true;
        try {
            await this.$store.dispatch('account/login', { email: this.email, password: this.password });

            this.$router.replace('/');
            this.loading = false;
        } catch (err) {
            if (typeof err != 'undefined') {
                alert('Error during account authentication.');
            }
            this.loading = false;
        }
    }
}
