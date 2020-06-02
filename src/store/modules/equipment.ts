import { Vue } from 'vue-property-decorator';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import firebase from '@/firebase';
import { Item } from '@/models/Item';

export interface EquipmentModuleState {
    equipment: Equipment;
}

export interface Equipment {
    head: Item | null;
    body: Item | null;
    main: Item | null;
    off: Item | null;
    legs: Item | null;
    feet: Item | null;
}

@Module({ namespaced: true })
class EquipmentModule extends VuexModule implements EquipmentModuleState {
    private _equipment: Equipment = {
        head: null,
        body: null,
        main: null,
        off: null,
        legs: null,
        feet: null,
    };

    get equipment(): Equipment {
        return this._equipment;
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
            // const id = snap.val();
            // const s = await firebase.db.ref(`items/${id}`).once('value');

            this.context.commit('removeItem', snap.key);
        });
    }
}

export default EquipmentModule;
