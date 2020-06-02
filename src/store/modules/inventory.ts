import { Vue } from 'vue-property-decorator';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import firebase from '@/firebase';
import { Item } from '@/models/Item';
import { Account } from '@/models/Account';

export interface InventoryModuleState {
    items: Item[];
}

@Module({ namespaced: true })
class InventoryModule extends VuexModule implements InventoryModuleState {
    private _all: { [key: string]: Item } = {};

    get items(): Item[] {
        return Object.values(this._all);
    }

    @Mutation
    public async setItem(data: { key: number; item: Item }) {
        Vue.set(this._all, data.key, data.item);
    }

    @Mutation
    public async removeItem(data: { key: number; item: Item }) {
        Vue.delete(this._all, data.key);
    }

    @Mutation
    public async changeOrder(payload: { account: Account; inventory: Item[] }) {
        const update: any = {};
        let i = 0;
        this._all = {};

        payload.inventory.forEach((item: Item) => {
            this._all[i] = item;

            update[i] = {
                id: item.id,
                amount: item.amount,
            };

            i++;
        });

        await firebase.db.ref(`inventory/${payload.account.id}`).set(update);
    }

    @Action
    public async init(firebaseUser: firebase.User) {
        firebase.db.ref(`inventory/${firebaseUser.uid}`).on('child_added', async (snap: any) => {
            const data = snap.val();
            if (data) {
                const s = await firebase.db.ref(`items/${data.id}`).once('value');

                this.context.commit('setItem', {
                    key: snap.key,
                    item: new Item({
                        id: data.id,
                        amount: data.amount,
                        ...s.val(),
                    }),
                });
            }
        });

        firebase.db.ref(`inventory/${firebaseUser.uid}`).on('child_changed', async (snap: any) => {
            const data = snap.val();
            const s = await firebase.db.ref(`items/${data.id}`).once('value');

            this.context.commit('setItem', {
                key: snap.key,
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

            this.context.commit('removeItem', {
                key: snap.key,
                item: new Item({
                    id: data.id,
                    amount: data.amount,
                    ...s.val(),
                }),
            });
        });
    }

    @Action
    public async equip(payload: { account: Account; item: Item }) {
        // Check if item slot is populated
        const s = await firebase.db.ref(`equipment/${payload.account.id}/${payload.item.slot}`).once('value');

        if (s.exists()) {
            // If so show an error
            alert('Another item is equipped already!');
        } else {
            // If not check if local item has amount > 1
            const snap = await firebase.db.ref(`inventory/${payload.account.id}`).once('value');
            const inventory = snap.val();
            const index = inventory.findIndex((i: Item) => {
                if (i) {
                    return i.id === payload.item.id;
                }
            });
            if (inventory[index].amount > 1) {
                // If so deduct 1 from amount and update db
                await firebase.db.ref(`inventory/${payload.account.id}/${index}/`).update({
                    amount: inventory[index].amount - 1,
                });
            } else {
                // If not remove the item from db
                await firebase.db.ref(`inventory/${payload.account.id}/${index}`).remove();
            }
            // Set the item for the slot in equipment
            await firebase.db.ref(`equipment/${payload.account.id}/${payload.item.slot}`).set(payload.item.id);
        }
    }

    @Action
    public async unequip(payload: { account: Account; item: Item }) {
        // Check if item exists in remote inventory
        // If so increase amount with 1
        // If not add new item to inventory
        const snap = await firebase.db.ref(`inventory/${payload.account.id}`).once('value');
        const inventory = snap.val();
        const index = inventory.findIndex((i: Item) => {
            if (i) {
                return i.id === payload.item.id;
            }
        });

        if (index > -1) {
            await firebase.db.ref(`inventory/${payload.account.id}/${index}/`).update({
                amount: inventory[index].amount + 1,
            });
        } else {
            await firebase.db.ref(`inventory/${payload.account.id}/${inventory.length}`).set({
                id: payload.item.id,
                amount: 1,
            });
        }

        await firebase.db.ref(`equipment/${payload.account.id}/${payload.item.slot}`).remove();
    }
}

export default InventoryModule;
