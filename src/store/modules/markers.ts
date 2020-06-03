import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { Vue } from 'vue-property-decorator';
import firebase from '@/firebase';
import { User } from '@/models/User';
import { Goblin } from '@/models/Enemies';
import { Loot } from '@/models/Loot';
import { Item } from '@/models/Item';

export interface MarkersModuleState {
    all: { [id: string]: User | Goblin };
    selected: User | Goblin | undefined;
}

@Module({ namespaced: true })
class MarkersModule extends VuexModule implements MarkersModuleState {
    private _all: { [id: string]: Goblin | User } = {};

    get all(): any {
        return this._all;
    }

    get selected(): User | Goblin | undefined {
        return Object.values(this._all).find((char: any) => {
            return char.selected;
        });
    }

    @Mutation
    public async addMarker(data: { id: string; position: { lat: number; lng: number }; marker: any }) {
        switch (data.marker.race) {
            case 'human':
                Vue.set(this._all, data.id, new User(data.id, data.marker));

                firebase.db.ref(`users/${data.marker.uid}`).on('child_changed', (s: any) => {
                    Vue.set(this._all[data.marker.uid], s.key, s.val());

                    console.log('User changed: ', s.key, s.val());
                });

                break;
            case 'goblin':
                Vue.set(this._all, data.id, new Goblin(data.id, data.marker));

                firebase.db.ref(`npc/${data.marker.id}`).on('child_changed', (s: any) => {
                    Vue.set(this._all[data.marker.id], s.key, s.val());

                    console.log('Enemy changed: ', s.key, s.val());
                });
                break;
            default:
                Vue.set(
                    this._all,
                    data.id,
                    new Loot(
                        data.id,
                        data.position,
                        new Item({
                            id: data.marker.id,
                            amount: data.marker.amount,
                            ...(await firebase.db.ref(`items/${data.marker.id}`).once('value')).val(),
                        }),
                    ),
                );

                firebase.db.ref(`loot/${data.marker.id}`).on('child_removed', (s: any) => {
                    Vue.delete(this._all[data.marker.id], s.key);

                    console.log('Loot removed: ', s.key, s.val());
                });
                break;
        }
    }

    @Mutation
    public removeMarker(id: string) {
        Vue.delete(this._all, id);
    }

    @Mutation
    public select(id: number) {
        if (this.selected) {
            this._all[this.selected.id].selected = false;
        }
        this._all[id].selected = true;
    }

    @Action
    public deselect() {
        if (this.selected) {
            this._all[this.selected.id].selected = false;
        }
    }

    @Action
    public async discover(firebaseUser: firebase.User) {
        firebase.db.ref(`users/${firebaseUser.uid}/hashes`).on('child_added', (hashSnap: any) => {
            firebase.db.ref(`markers/${hashSnap.val()}`).on('child_added', async (markerSnap: any) => {
                const refSnap = await firebase.db.ref(markerSnap.val().ref).once('value');

                this.context.commit('addMarker', {
                    id: refSnap.key,
                    position: markerSnap.val().position,
                    marker: refSnap.val(),
                });
            });

            firebase.db.ref(`markers/${hashSnap.val()}`).on('child_removed', async (markerSnap: any) => {
                const refSnap = await firebase.db.ref(markerSnap.val().ref).once('value');

                if (refSnap.key !== firebaseUser.uid) {
                    this.context.commit('removeMarker', refSnap.key);
                }
            });

            console.log('Hash added: ', firebaseUser.uid, hashSnap.val());
        });

        firebase.db.ref(`users/${firebaseUser.uid}/hashes`).on('child_removed', async (hashSnap: any) => {
            const markerSnap = await firebase.db.ref(`markers/${hashSnap.val()}`).once('value');

            markerSnap.val().forEach((marker: any, key: string) => {
                if (markerSnap.key !== firebaseUser.uid) {
                    this.context.commit('removeMarker', key);
                }
            });

            console.log('Hash removed: ', firebaseUser.uid, hashSnap.val());
        });
    }
}

export default MarkersModule;
