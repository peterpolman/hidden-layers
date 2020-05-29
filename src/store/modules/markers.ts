import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { Vue } from 'vue-property-decorator';
import firebase from '@/firebase';

export interface MarkersModuleState {
    all: any;
    visible: any;
}

@Module({ namespaced: true })
class MarkersModule extends VuexModule implements MarkersModuleState {
    private _markers: { [id: string]: any } = {};
    private _listeners: any[] = [];

    get all() {
        console.log(this._markers);
        return this._markers;
    }

    get visible() {
        return this._markers;
    }

    @Mutation
    public addMarker(id: string, marker: any) {
        Vue.set(this._markers, id, marker);

        console.log('Marker added: ', id);
    }

    @Mutation
    public removeMarker(id: string) {
        Vue.delete(this._markers, id);

        console.log('Marker removed: ', id);
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

                this.context.commit('removeMarker', snap.val().id);
            });

            console.log('Hash added: ', firebaseUser.uid, s.key);
        });

        firebase.db.ref(`users/${firebaseUser.uid}/hashes`).on('child_removed', async (s: any) => {
            // delete all markers for this hash
            const snap = await firebase.db.ref(`markers/${s.key}`).once('value');

            snap.val().forEach((marker: any) => {
                this.context.commit('removeMarker', marker.id);
            });

            // delete listener for this hash
            delete this._listeners[s.key];

            console.log('Hash removed: ', firebaseUser.uid, s.key);
        });
    }
}

export default MarkersModule;
