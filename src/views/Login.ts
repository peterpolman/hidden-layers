import { Vue, Component } from 'vue-property-decorator';

@Component({
    name: 'login',
})
export default class Login extends Vue {
    email = '';
    password = '';
    loading = false;

    async login() {
        this.loading = true;
        await this.$store.dispatch('account/login', { email: this.email, password: this.password });
        this.loading = false;
        this.$router.replace('/');
    }
}
