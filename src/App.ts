import { Vue, Component } from 'vue-property-decorator';
import firebase from '@/firebase';

@Component({
    name: 'App',
})
export default class App extends Vue {
    created() {
        firebase.auth.onAuthStateChanged((user: firebase.User | any) => {
            if (user) {
                this.$store.dispatch('account/init', user);
                this.$store.dispatch('inventory/init', user);
                this.$store.dispatch('equipment/init', user);
                this.$store.dispatch('markers/discover', user);
            } else {
                this.$router.replace('login');
            }
        });
    }
}
