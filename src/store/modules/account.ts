import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { firebaseAction } from 'vuexfire';
import firebase from '@/firebase';
import { User } from '@/models/User';
import { Scout } from '@/models/Scout';
import { Account } from '@/models/Account';
import Geohash from 'latlon-geohash';
import axios from 'axios';
import config from '@/config.json';

export interface AccountModuleState {
    account: Account | null;
    scout: Account | null;
}

@Module({ namespaced: true })
class AccountModule extends VuexModule implements AccountModuleState {
    private _data: any = null;
    private _scout: any = null;

    get account(): any {
        return this._data ? new Account(this._data.uid, this._data) : null;
    }

    get scout(): any {
        return this._scout ? new Scout(this._scout.id, this._scout) : null;
    }

    @Mutation
    public removeAccount() {
        this._data = null;
    }

    @Action
    public async toggleLockCamera() {
        await firebase.db.ref(`users/${this._data.uid}`).update({
            lockCamera: !this._data.lockCamera,
        });
    }

    @Action
    public async initUser(firebaseUser: firebase.User) {
        const action = firebaseAction(async ({ bindFirebaseRef }) => {
            return bindFirebaseRef('_data', firebase.db.ref(`users/${firebaseUser.uid}`));
        }) as any; // Call function that firebaseAction returns
        return action(this.context);
    }

    @Action
    public async initScout(firebaseUser: firebase.User) {
        const action = firebaseAction(async ({ bindFirebaseRef }) => {
            const snap = await firebase.db.ref(`users/${firebaseUser.uid}/scout`).once('value');
            return bindFirebaseRef('_scout', firebase.db.ref(`scouts/${snap.val()}`));
        }) as any; // Call function that firebaseAction returns
        return action(this.context);
    }

    @Action
    public async setPosition(payload: { account: User; heading: number; position: { lat: number; lng: number } }) {
        const oldHash = Geohash.encode(this._data.position.lat, this._data.position.lng, 7);
        const hash = Geohash.encode(payload.position.lat, payload.position.lng, 7);

        // Remove the old record if they differ
        if (oldHash !== hash) {
            const hashes: { [hash: string]: string } = {};
            const neighbours = Geohash.neighbours(hash);

            for (const direction in neighbours) {
                const h = neighbours[direction];

                hashes[h] = h;
            }

            hashes[hash] = hash;

            await firebase.db.ref(`markers/${oldHash}/${this._data.uid}`).remove();
            await firebase.db.ref(`markers/${hash}/${this._data.uid}`).update({
                position: payload.position,
                ref: `users/${this._data.uid}`,
            });
            await firebase.db.ref(`users/${payload.account.id}/hashes`).set(hashes);
            await firebase.db.ref(`users/${payload.account.id}/visibility`).set({
                ...this.scout.hashes,
                ...hashes,
            });
            console.log('User is added to this hash', hash);
        }

        // Set the new record
        await firebase.db.ref(`users/${payload.account.id}`).update({
            heading: payload.heading,
            position: payload.position,
        });
    }

    @Action
    public async logout() {
        return firebase.auth.signOut().then(() => {
            this.context.commit('removeAccount');

            const action = firebaseAction(({ unbindFirebaseRef }) => {
                return unbindFirebaseRef('_data');
            }) as any;
            return action(this.context);
        });
    }

    @Action
    public async updateExperiencepoints(target: any) {
        const xp = 100 + (target.level - this._data.level) * 10;
        const newXP = this._data.experiencePoints + xp;
        const maxXP = this._data.level * 100;

        if (newXP < maxXP) {
            await firebase.db.ref(`users/${this._data.uid}/experiencePoints`).set(newXP);
        } else {
            const diff = xp - (maxXP - this._data.experiencePoints);

            await firebase.db.ref(`users/${this._data.uid}/level`).set(this._data.level + 1);
            await firebase.db.ref(`users/${this._data.uid}/experiencePoints`).set(diff);
        }
    }

    @Action
    public login({ email, password }: { email: string; password: string }) {
        return firebase.auth.signInWithEmailAndPassword(email, password);
    }

    @Action
    public async moveScout(payload: { from: any; to: any }) {
        const origin = [payload.from.lng, payload.from.lat];
        const destination = [payload.to.lng, payload.to.lat];
        const r = await axios.get(
            'https://api.mapbox.com/directions/v5/mapbox/walking/' +
                [origin, destination].join(';') +
                '?geometries=geojson&access_token=' +
                config.mapbox.key,
        );

        firebase.db
            .ref('scouts')
            .child(this._data.scout)
            .update({
                route: {
                    now: firebase.database.ServerValue.TIMESTAMP,
                    start: firebase.database.ServerValue.TIMESTAMP,
                    options: {
                        path: r.data.routes[0].geometry.coordinates,
                        duration: r.data.routes[0].duration * 60,
                    },
                },
            });
    }

    @Action
    public async register(payload: { account: { email: string; password: string }; user: User }) {
        const credentials = await firebase.auth.createUserWithEmailAndPassword(
            payload.account.email,
            payload.account.password,
        );

        if (credentials.user) {
            return await firebase.db.ref(`users/${credentials.user.uid}`).set({
                uid: credentials.user.uid,
                email: payload.account.email,
                ...payload.user,
            });
        }
    }
}

export default AccountModule;
