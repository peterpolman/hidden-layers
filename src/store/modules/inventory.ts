import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import firebase from '@/firebase';
import { Item } from '@/models/Item';
import { Account } from '@/models/Account';

export interface InventoryModuleState {
    items: Item[];
}

@Module({ namespaced: true })
class InventoryModule extends VuexModule implements InventoryModuleState {
    private _all: Item[] = [];

    get items(): Item[] {
        return this._all;
    }

    set items(inventory: Item[]) {
        this._all = inventory;
    }

    @Mutation
    public async addItem(item: Item) {
        this._all.push(item);
    }

    @Mutation
    public async setItem(data: { key: number; item: Item }) {
        this._all.splice(data.key, 1, data.item);
    }

    @Mutation
    public async removeItem(item: Item) {
        const index = this._all.indexOf(item);
        this._all.splice(index, 1);
    }

    @Mutation
    public async changeOrder(payload: { account: Account; inventory: Item[] }) {
        this._all = payload.inventory;

        await firebase.db.ref(`inventory/${payload.account.id}`).set(
            payload.inventory.map((item: Item) => {
                return {
                    id: item.id,
                    amount: item.amount,
                };
            }),
        );
    }

    @Action
    public async init(firebaseUser: firebase.User) {
        firebase.db.ref(`inventory/${firebaseUser.uid}`).on('child_added', async (snap: any) => {
            const data = snap.val();
            const s = await firebase.db.ref(`items/${data.id}`).once('value');

            this.context.commit(
                'addItem',
                new Item({
                    id: data.id,
                    amount: data.amount,
                    ...s.val(),
                }),
            );
        });

        firebase.db.ref(`inventory/${firebaseUser.uid}`).on('child_changed', async (snap: any) => {
            const data = snap.val();
            const s = await firebase.db.ref(`items/${data.id}`).once('value');

            this.context.commit('setItem', {
                key: parseInt(snap.key),
                item: new Item({
                    id: data.id,
                    amount: data.amount,
                    ...s.val(),
                }),
            });
        });

        firebase.db.ref(`inventory/${firebaseUser.uid}`).on('child_removed', async (snap: any) => {
            const data = snap.val();
            const s = await firebase.db.ref(`items/${data.id}`).once('value');

            this.context.commit(
                'removeItem',
                new Item({
                    id: data.id,
                    amount: data.amount,
                    ...s.val(),
                }),
            );
        });
    }

    @Action
    public async increase() {
        debugger;
    }
}

export default InventoryModule;
