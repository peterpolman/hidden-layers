import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { Vue } from 'vue-property-decorator';
import firebase from '@/firebase';
import { User } from '@/models/User';
import { Goblin } from '@/models/Enemies';

export interface MarkersModuleState {
    all: { [id: string]: User | Goblin };
    users: { [id: string]: User };
    enemies: { [id: string]: Goblin };
}

@Module({ namespaced: true })
class MarkersModule extends VuexModule implements MarkersModuleState {
    private _all: { [id: string]: Goblin | User } = {};
    private _target!: Goblin | User | undefined;

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

    get target() {
        return this._target;
    }

    @Action
    public setTarget(id: string) {
        this._all[id].target = true;
    }

    @Mutation
    public addMarker(marker: any) {
        switch (marker.race) {
            case 'human':
                const user = new User(marker.uid, marker);

                Vue.set(this._all, user.id, user);

                console.log('User added: ', user);
                break;
            case 'goblin':
                const goblin = new Goblin(marker.id, marker);

                Vue.set(this._all, goblin.id, goblin);

                console.log('Enemy added: ', goblin);
                break;
        }
    }

    @Mutation
    public removeMarker(marker: any) {
        Vue.delete(this._all, marker.id);
    }

    @Action
    public async discover(firebaseUser: firebase.User) {
        firebase.db.ref(`users/${firebaseUser.uid}/hashes`).on('child_added', (s: any) => {
            // Bind to markers added to this hash
            firebase.db.ref(`markers/${s.key}`).on('child_added', async (s: any) => {
                const snap = await firebase.db.ref(s.val().ref).once('value');

                this.context.commit('addMarker', snap.val());
            });

            // Bind to markers removed from this hash
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
