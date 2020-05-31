import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { Vue } from 'vue-property-decorator';
import firebase from '@/firebase';
import { User } from '@/models/User';
import { Goblin } from '@/models/Enemies';
import { firebaseAction } from 'vuexfire';

export interface MarkersModuleState {
    all: { [id: string]: User | Goblin };
}

@Module({ namespaced: true })
class MarkersModule extends VuexModule implements MarkersModuleState {
    private _all: { [id: string]: Goblin | User } = {};

    get all(): any {
        return this._all;
    }

    get users(): any {
        return Object.values(this._all).filter((char: any) => {
            return char.race === 'human';
        });
    }

    get enemies(): any {
        return Object.values(this._all).filter((char: any) => {
            return char.race === 'goblin';
        });
    }

    get selected() {
        return Object.values(this._all).find((char: any) => {
            return char.selected;
        });
    }

    @Mutation
    public addMarker(marker: any) {
        switch (marker.race) {
            case 'human':
                const user = new User(marker.uid, marker);

                Vue.set(this._all, user.id, user);

                console.log('User added: ', user);

                firebase.db.ref(`users/${user.id}`).on('child_changed', (s: any) => {
                    Vue.set(this._all[user.id], s.key, s.val());

                    console.log('User changed: ', s.key, s.val());
                });

                break;
            case 'goblin':
                const goblin = new Goblin(marker.id, marker);

                Vue.set(this._all, goblin.id, goblin);

                console.log('Enemy added: ', goblin);

                firebase.db.ref(`npc/${goblin.id}`).on('child_changed', (s: any) => {
                    Vue.set(this._all[goblin.id], s.key, s.val());

                    console.log('Enemy changed: ', s.key, s.val());
                });
                break;
        }
    }

    @Mutation
    public removeMarker(marker: any) {
        Vue.delete(this._all, marker.id);
    }

    @Action
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
            firebase.db.ref(`markers/${s.key}`).on('child_added', async (s: any) => {
                const snap = await firebase.db.ref(s.val().ref).once('value');
                this.context.commit('addMarker', snap.val());
            });

            firebase.db.ref(`markers/${s.key}`).on('child_removed', async (s: any) => {
                const snap = await firebase.db.ref(s.val().ref).once('value');
                this.context.commit('removeMarker', s.key);
            });

            console.log('Hash added: ', firebaseUser.uid, s.key);
        });

        firebase.db.ref(`users/${firebaseUser.uid}/hashes`).on('child_removed', async (s: any) => {
            // delete all markers for this hash
            const snap = await firebase.db.ref(`markers/${s.key}`).once('value');

            snap.val().forEach((marker: any) => {
                this.context.commit('removeMarker', marker);
            });

            console.log('Hash removed: ', firebaseUser.uid, s.key);
        });
    }
}

export default MarkersModule;
