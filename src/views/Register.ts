import { Vue, Component } from 'vue-property-decorator';
import { BButton, BSpinner } from 'bootstrap-vue';
import Geohash from 'latlon-geohash';

@Component({
    name: 'register',
    components: {
        'b-button': BButton,
        'b-spinner': BSpinner,
    },
})
export default class Register extends Vue {
    email = '';
    password = '';
    passwordVerify = '';
    coords: any = null;
    userName = '';
    userRace = 'human';
    userClass = 'knight';
    loading = false;

    async mounted() {
        this.coords = await this.getCoords();
    }

    async register() {
        if (this.password === this.passwordVerify) {
            this.loading = true;

            try {
                const hash = Geohash.encode(this.coords.lat, this.coords.lng, 7);
                const neighbours = Geohash.neighbours(hash);
                const hashes = [hash];

                for (const n in neighbours) {
                    hashes.push(neighbours[n]);
                }

                const user = {
                    class: this.userClass,
                    experiencePoints: 0,
                    hitPoints: 100,
                    level: 1,
                    lockCamera: false,
                    name: this.userName,
                    heading: 0,
                    position: {
                        lat: this.coords.lat,
                        lng: this.coords.lng,
                    },
                    race: this.userRace,
                    hashes,
                    visibility: hashes,
                };
                await this.$store.dispatch('account/register', {
                    account: {
                        email: this.email,
                        password: this.password,
                    },
                    user: user,
                });
                this.$router.replace('/');
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

    getCoords() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (r) => {
                    resolve({ heading: r.coords.heading, lat: r.coords.latitude, lng: r.coords.longitude });
                },
                (err) => {
                    reject(err.message);
                },
                { enableHighAccuracy: true, maximumAge: 1000, timeout: 30000 },
            );
        });
    }
}
