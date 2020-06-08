import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { firebaseAction } from 'vuexfire';
import firebase from '@/firebase';
import { User } from '@/models/User';
import { Account } from '@/models/Account';
import Geohash from 'latlon-geohash';
import axios from 'axios';
import config from '@/config.json';

export interface AccountModuleState {
    account: Account | null;
}

@Module({ namespaced: true })
class AccountModule extends VuexModule implements AccountModuleState {
    private _data: any = null;

    get account(): any {
        return this._data ? new Account(this._data.uid, this._data) : null;
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
    public async init(firebaseUser: firebase.User) {
        const action = firebaseAction(async ({ bindFirebaseRef }) => {
            return bindFirebaseRef('_data', firebase.db.ref(`users/${firebaseUser.uid}`));
        }) as any; // Call function that firebaseAction returns
        return action(this.context);
    }

    @Action
    public async setPosition(payload: { account: User; heading: number; position: { lat: number; lng: number } }) {
        const oldHash = Geohash.encode(this._data.position.lat, this._data.position.lng, 7);
        const hash = Geohash.encode(payload.position.lat, payload.position.lng, 7);
        let hashes = this._data.hashes;

        // Remove the old record if they differ
        if (oldHash !== hash) {
            const neighbours = Geohash.neighbours(hash);

            await firebase.db.ref('markers').child(oldHash).child(this._data.uid).remove();
            await firebase.db
                .ref('markers')
                .child(hash)
                .child(this._data.uid)
                .update({
                    position: payload.position,
                    ref: `users/${this._data.uid}`,
                });

            hashes = [];
            hashes.push(hash);

            for (const n in neighbours) {
                hashes.push(neighbours[n]);
            }
        }

        // Set the new record
        await firebase.db.ref(`users/${payload.account.id}`).update({
            heading: payload.heading,
            position: payload.position,
            hashes,
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
