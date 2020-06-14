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
    private _all: { [key: string]: any } = {};

    get items(): any[] {
        return Object.values(this._all);
    }

    @Mutation
    public async setItem(data: { key: number; item: any }) {
        Vue.set(this._all, data.key, data.item);
    }

    @Mutation
    public async removeItem(data: { key: number; item: any }) {
        Vue.delete(this._all, data.key);
    }

    @Mutation
    public async changeOrder(payload: { account: Account; inventory: any[] }) {
        const update: any = {};
        this._all = {};

        payload.inventory.forEach((item: Item) => {
            this._all[item.slug] = item;

            update[item.slug] = {
                id: item.id,
                amount: item.amount,
            };
        });

        await firebase.db.ref(`inventory/${payload.account.id}`).set(update);
    }

    @Action
    public async init(firebaseUser: firebase.User) {
        // firebase.db.ref(`items`).push().set({
        //     name: 'Vision Ward',
        //     slug: 'ward',
        //     value: 50,
        //     description: '',
        //     rarity: 1,
        //     slot: 'main',
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
    public async add(payload: { account: Account; item: Item; amount: number }) {
        const snap = await firebase.db.ref(`inventory/${payload.account.id}/${payload.item.slug}`).once('value');

        if (snap.exists()) {
            await firebase.db.ref(`inventory/${payload.account.id}/${payload.item.slug}/`).update({
                amount: snap.val().amount + payload.amount,
            });
        } else {
            return await firebase.db.ref(`inventory/${payload.account.id}/${payload.item.slug}`).set({
                id: payload.item.id,
                amount: payload.amount,
            });
        }
    }

    @Action
    public async remove(payload: { account: Account; item: Item; amount: number }) {
        const snap = await firebase.db.ref(`inventory/${payload.account.id}/${payload.item.slug}`).once('value');
        const inventoryItem = snap.val();

        if (inventoryItem.amount > payload.amount) {
            await firebase.db.ref(`inventory/${payload.account.id}/${payload.item.slug}/`).update({
                amount: inventoryItem.amount - payload.amount,
            });
        } else {
            await firebase.db.ref(`inventory/${payload.account.id}/${payload.item.slug}`).remove();
        }
    }

    @Action
    public async equip(payload: { account: Account; item: Item }) {
        const s = await firebase.db.ref(`equipment/${payload.account.id}/${payload.item.slot}`).once('value');

        if (s.exists()) {
            alert('Another item is equipped already! Unequip this one first.');
        } else {
            await this.context.dispatch('remove', { ...payload, amount: 1 });
            await firebase.db.ref(`equipment/${payload.account.id}/${payload.item.slot}`).set(payload.item.id);
        }
    }

    @Action
    public async unequip(payload: { account: Account; item: Item; destroy: boolean }) {
        if (!payload.destroy) {
            await this.context.dispatch('add', { ...payload, amount: 1 });
        }
        await firebase.db.ref(`equipment/${payload.account.id}/${payload.item.slot}`).remove();
    }

    @Action
    public async place(payload: { position: { lat: number; lng: number }; item: Item }) {
        const lootHash = Geohash.encode(payload.position.lat, payload.position.lng, 9);
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
    }

    @Action
    public async drop(payload: { account: Account; item: Item }) {
        await this.context.dispatch('place', { position: payload.account.position, item: payload.item });
        await this.context.dispatch('remove', { ...payload, amount: payload.item.amount });
    }

    @Action
    public async pickup(payload: { account: Account; loot: Loot }) {
        const hash = Geohash.encode(payload.loot.position.lat, payload.loot.position.lng, 7);

        await firebase.db.ref(`markers/${hash}/${payload.loot.id}`).remove();
        await firebase.db.ref(`loot/${payload.loot.id}`).remove();
        await this.context.dispatch('add', {
            account: payload.account,
            item: payload.loot.item,
            amount: payload.loot.item.amount,
        });
    }
}

export default InventoryModule;
