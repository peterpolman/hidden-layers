import { Vue, Component } from 'vue-property-decorator';

@Component({
    name: 'logout',
})
export default class Logout extends Vue {
    mounted() {
        this.$store.dispatch('account/logout').then(() => {
            this.$router.replace('login');
        });
    }
}
