import { Vue } from 'vue-property-decorator';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import firebase from '@/firebase';
import { Item } from '@/models/Item';
import { Loot } from '@/models/Loot';
import { Account } from '@/models/Account';
import Geohash from 'latlon-geohash';

const randomPosition = (bounds: any) => {
    const x_max = bounds.ne.lat;
    const x_min = bounds.sw.lat;
    const y_max = bounds.ne.lon;
    const y_min = bounds.sw.lon;

    return {
        lat: x_min + Math.random() * (x_max - x_min),
        lng: y_min + Math.random() * (y_max - y_min),
    };
};

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
        // firebase.db.ref(`items`).push().set({
        //     description: 'Make some stuff!',
        //     name: 'Tools',
        //     rarity: 3,
        //     slot: 'off',
        //     slug: 'tools',
        //     value: 150,
        // });

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
    public async add(payload: { account: Account; item: Item }) {
        const snap = await firebase.db.ref(`inventory/${payload.account.id}`).once('value');
        const inventory = snap.val();
        const index = inventory.findIndex((i: Item) => {
            if (i) {
                return i.id === payload.item.id;
            }
        });

        if (index > -1) {
            return await firebase.db.ref(`inventory/${payload.account.id}/${index}/`).update({
                amount: inventory[index].amount + 1,
            });
        } else {
            return await firebase.db.ref(`inventory/${payload.account.id}/${inventory.length}`).set({
                id: payload.item.id,
                amount: 1,
            });
        }
    }

    @Action
    public async remove(payload: { account: Account; item: Item }) {
        const snap = await firebase.db.ref(`inventory/${payload.account.id}`).once('value');
        const inventory = snap.val();
        const index = inventory.findIndex((i: Item) => {
            if (i) {
                return i.id === payload.item.id;
            }
        });

        if (inventory[index].amount > 1) {
            await firebase.db.ref(`inventory/${payload.account.id}/${index}/`).update({
                amount: inventory[index].amount - 1,
            });
        } else {
            await firebase.db.ref(`inventory/${payload.account.id}/${index}`).remove();
        }
    }

    @Action
    public async equip(payload: { account: Account; item: Item }) {
        // Check if item slot is populated
        const s = await firebase.db.ref(`equipment/${payload.account.id}/${payload.item.slot}`).once('value');

        if (s.exists()) {
            // If so show an error
            alert('Another item is equipped already!');
        } else {
            await this.context.dispatch('remove', payload);
            // Set the item for the slot in equipment
            await firebase.db.ref(`equipment/${payload.account.id}/${payload.item.slot}`).set(payload.item.id);
        }
    }

    @Action
    public async unequip(payload: { account: Account; item: Item }) {
        await this.context.dispatch('add', payload);

        await firebase.db.ref(`equipment/${payload.account.id}/${payload.item.slot}`).remove();
    }

    @Action
    public async getItemIndex(payload: { account: Account; item: Item }) {
        const snap = await firebase.db.ref(`inventory/${payload.account.id}`).once('value');

        return snap.val().findIndex((i: Item) => {
            if (i) {
                return i.id === payload.item.id;
            }
        });
    }

    @Action
    public async drop(payload: { account: Account; item: Item }) {
        const lootHash = Geohash.encode(payload.account.position.lat, payload.account.position.lng, 9);
        const lootBounds = Geohash.bounds(lootHash);
        const lootPosition = randomPosition(lootBounds);
        const hash = Geohash.encode(lootPosition.lat, lootPosition.lng, 7);
        const snap = await firebase.db.ref(`loot`).push();

        await firebase.db.ref(`loot/${snap.key}`).set({
            id: payload.item.id,
            amount: payload.item.amount,
        });

        await firebase.db.ref(`markers/${hash}/${snap.key}`).set({
            position: lootPosition,
            ref: `loot/${snap.key}`,
        });

        return await this.context.dispatch('remove', payload);
    }

    @Action
    public async pickup(payload: { account: Account; loot: Loot }) {
        const hash = Geohash.encode(payload.loot.position.lat, payload.loot.position.lng, 7);

        await firebase.db.ref(`markers/${hash}/${payload.loot.id}`).remove();
        await firebase.db.ref(`loot/${payload.loot.id}`).remove();

        this.context.dispatch('add', { account: payload.account, item: payload.loot.item });
    }
}

export default InventoryModule;
