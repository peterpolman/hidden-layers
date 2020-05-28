import { Module, VuexModule, Action } from 'vuex-module-decorators';
import { firebaseAction } from 'vuexfire';
import firebase from '@/firebase';
import Item from '@/models/Item';

export interface InventoryModuleState {
    items: any;
}

@Module({ namespaced: true })
class InventoryModule extends VuexModule implements InventoryModuleState {
    private _all: any = null;

    get items() {
        return this._all;
    }

    @Action
    public init(firebaseUser: firebase.User) {
        const action = firebaseAction(({ bindFirebaseRef }) => {
            return bindFirebaseRef('_all', firebase.db.ref(`items/${firebaseUser.uid}`));
        }) as any; // Call function that firebaseAction returns
        return action(this.context);
    }

    @Action
    public async add(firebaseUser: firebase.User, item: Item, amount = 1) {
        await firebase.db.ref(`items/${firebaseUser.uid}/${item.slug}`).update({ amount: item.amount + amount });
    }

    @Action
    public async substract(firebaseUser: firebase.User, item: Item, amount = 1) {
        await firebase.db.ref(`items/${firebaseUser.uid}/${item.slug}`).update({ amount: item.amount - amount });
    }
}

export default InventoryModule;
