import { Vue, Component } from 'vue-property-decorator';
// import Geohash from 'latlon-geohash';

@Component({
    name: 'register',
})
export default class Register extends Vue {
    email = '';
    password = '';
    passwordVerify = '';
    position = null;
    userName = '';
    userRace = 'human';
    userClass = 'knight';
    loading = false;

    async mounted() {
        await this.getPosition();
    }

    async register() {
        this.loading = true;
        if (this.password === this.passwordVerify) {
            this.loading = true;

            try {
                await this.$store.dispatch('account/register', { email: this.email, password: this.password });

                this.loading = false;
            } catch (err) {
                if (typeof err != 'undefined') {
                    alert('Error during account registration.');
                }
                this.loading = false;
            }
        } else {
            alert('Your passwords do not match.');
        }
    }

    getPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (r) => {
                    resolve({ lat: r.coords.latitude, lng: r.coords.longitude });
                },
                (err) => {
                    reject(err.message);
                },
                { enableHighAccuracy: true, maximumAge: 1000, timeout: 30000 },
            );
        });
    }
}
