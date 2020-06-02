import { Module, VuexModule, Action } from 'vuex-module-decorators';
import { firebaseAction } from 'vuexfire';
import firebase from '@/firebase';
import { User } from '@/models/User';
import { Account } from '@/models/Account';

export interface AccountModuleState {
    account: Account;
}

@Module({ namespaced: true })
class AccountModule extends VuexModule implements AccountModuleState {
    private _account: any = null;

    get account(): any {
        if (this._account) {
            return new Account(this._account.uid, this._account);
        }
    }

    @Action
    public init(firebaseUser: firebase.User) {
        const action = firebaseAction(async ({ bindFirebaseRef }) => {
            return bindFirebaseRef('_account', firebase.db.ref(`users/${firebaseUser.uid}`));
        }) as any; // Call function that firebaseAction returns
        return action(this.context);
    }

    @Action
    public async setPosition(payload: { account: User; position: { lat: number; lng: number } }) {
        return await firebase.db.ref(`users/${payload.account.id}`).update({ position: payload.position });
    }

    @Action
    public logout() {
        return firebase.auth.signOut().then(() => {
            this.context.dispatch('reset', null, { root: true });
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

    @Action
    public reset() {
        const action = firebaseAction(({ unbindFirebaseRef }) => {
            return unbindFirebaseRef('_account');
        }) as any;
        return action(this.context);
    }
}

export default AccountModule;
