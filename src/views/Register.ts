import { Vue, Component } from 'vue-property-decorator';
import firebase from '@/firebase';
import Geohash from 'latlon-geohash';

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

    register() {
        this.loading = true;
        if (this.password === this.passwordVerify) {
            const position = this.position;
            this.createAccount(position);
        } else {
            alert('Your passwords do not match.');
        }
    }

    createAccount(position: any) {
        firebase.auth
            .createUserWithEmailAndPassword(this.email, this.password)
            .then((r: any) => {
                const scout = {
                    id: firebase.db.ref('scouts').push().key,
                    uid: r.user.uid,
                    hitPoints: 100,
                    level: 1,
                    name: `${this.userName}'s scout`,
                    race: 'wolf',
                    position: {
                        lat: position.latitude + 0.00001,
                        lng: position.longitude + 0.00001,
                    },
                };
            })
            .catch((err) => {
                if (typeof err != 'undefined') {
                    alert('Error during account registration.');
                }
                this.loading = false;
            });
    }
}
