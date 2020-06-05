import { Vue } from 'vue-property-decorator';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import firebase from '@/firebase';
import { Item } from '@/models/Item';

export interface EquipmentModuleState {
    equipment: { [slot: string]: Item | null };
    active: Item | null;
}

@Module({ namespaced: true })
class EquipmentModule extends VuexModule implements EquipmentModuleState {
    private _equipment: { [slot: string]: Item | null } = {
        head: null,
        body: null,
        main: null,
        off: null,
        legs: null,
        feet: null,
    };
    private _active: Item | null = null;

    get equipment(): { [slot: string]: Item | null } {
        return this._equipment;
    }

    get active(): Item | null {
        return this._active;
    }

    @Mutation
    public async activate(item: Item) {
        this._active = item;
    }

    @Mutation
    public async deactivate() {
        if (this._active) {
            Vue.set(this._active, 'active', false);
            this._active = null;
        }
    }

    @Mutation
    public async setItem(data: { slot: string; item: Item }) {
        Vue.set(this._equipment, data.slot, data.item);
    }

    @Mutation
    public async removeItem(key: string) {
        Vue.set(this._equipment, key, null);
    }

    @Action
    public async init(firebaseUser: firebase.User) {
        firebase.db.ref(`equipment/${firebaseUser.uid}`).on('child_added', async (snap: any) => {
            const id = snap.val();
            const s = await firebase.db.ref(`items/${id}`).once('value');

            this.context.commit('setItem', {
                slot: snap.key,
                item: new Item({
                    id: id,
                    amount: 1,
                    ...s.val(),
                }),
            });
        });

        firebase.db.ref(`equipment/${firebaseUser.uid}`).on('child_removed', async (snap: any) => {
            this.context.commit('removeItem', snap.key);
        });
    }
}

export default EquipmentModule;
