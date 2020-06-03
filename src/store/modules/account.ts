import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { firebaseAction } from 'vuexfire';
import firebase from '@/firebase';
import { User } from '@/models/User';
import { Account } from '@/models/Account';
import Geohash from 'latlon-geohash';

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
    public init(firebaseUser: firebase.User) {
        const action = firebaseAction(async ({ bindFirebaseRef }) => {
            return bindFirebaseRef('_data', firebase.db.ref(`users/${firebaseUser.uid}`));
        }) as any; // Call function that firebaseAction returns
        return action(this.context);
    }

    @Action
    public async setPosition(payload: { account: User; position: { lat: number; lng: number } }) {
        const oldHash = Geohash.encode(this._data.position.lat, this._data.position.lng, 7);
        const hash = Geohash.encode(payload.position.lat, payload.position.lng, 7);
        let hashes = this._data.hashes;

        // Remove the old record if they differ
        if (oldHash !== hash) {
            const neighbours = Geohash.neighbours(hash);

            firebase.db.ref('markers').child(oldHash).child(this._data.uid).remove();
            firebase.db
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
    public register({ email, password }: { email: string; password: string }) {
        return firebase.auth.createUserWithEmailAndPassword(email, password);
    }
}

export default AccountModule;
