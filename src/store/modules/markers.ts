import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { Vue } from 'vue-property-decorator';
import firebase from '@/firebase';
import { User } from '@/models/User';
import { Goblin } from '@/models/Enemies';

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
    public addMarker(marker: any) {
        switch (marker.race) {
            case 'human':
                Vue.set(this._all, marker.uid, new User(marker.uid, marker));

                firebase.db.ref(`users/${marker.uid}`).on('child_changed', (s: any) => {
                    Vue.set(this._all[marker.uid], s.key, s.val());

                    console.log('User changed: ', s.key, s.val());
                });

                break;
            case 'goblin':
                Vue.set(this._all, marker.id, new Goblin(marker.id, marker));

                firebase.db.ref(`npc/${marker.id}`).on('child_changed', (s: any) => {
                    Vue.set(this._all[marker.id], s.key, s.val());

                    console.log('Enemy changed: ', s.key, s.val());
                });
                break;
        }
    }

    @Mutation
    public removeMarker(marker: any) {
        Vue.delete(this._all, marker.uid || marker.id);
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
        firebase.db.ref(`users/${firebaseUser.uid}/hashes`).on('child_added', (s: any) => {
            firebase.db.ref(`markers/${s.val()}`).on('child_added', async (s: any) => {
                const snap = await firebase.db.ref(s.val().ref).once('value');
                this.context.commit('addMarker', snap.val());
            });

            firebase.db.ref(`markers/${s.val()}`).on('child_removed', async (s: any) => {
                const snap = await firebase.db.ref(s.val().ref).once('value');

                if (snap.key !== firebaseUser.uid) {
                    this.context.commit('removeMarker', snap.key);
                }
            });

            console.log('Hash added: ', firebaseUser.uid, s.key);
        });

        firebase.db.ref(`users/${firebaseUser.uid}/hashes`).on('child_removed', async (s: any) => {
            const snap = await firebase.db.ref(`markers/${s.val()}`).once('value');

            snap.val().forEach((marker: any) => {
                if (snap.key !== firebaseUser.uid) {
                    this.context.commit('removeMarker', marker);
                }
            });

            console.log('Hash removed: ', firebaseUser.uid, s.key);
        });
    }
}

export default MarkersModule;
