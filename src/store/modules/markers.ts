import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { Vue } from 'vue-property-decorator';
import firebase from '@/firebase';
import { User } from '@/models/User';
import { Goblin } from '@/models/Enemies';
import { Loot } from '@/models/Loot';
import { Item } from '@/models/Item';
import { Ward } from '@/models/Ward';
import { Scout } from '@/models/Scout';
import { Account } from '@/models/Account';
import Geohash from 'latlon-geohash';

export interface MarkersModuleState {
    all: { [id: string]: User | Goblin | Ward | Loot };
    wards: Ward[];
    users: User[];
    goblins: Goblin[];
    selected: User | Goblin | Ward | Scout | Loot | undefined;
}

@Module({ namespaced: true })
class MarkersModule extends VuexModule implements MarkersModuleState {
    private _all: { [id: string]: Goblin | User | Ward } = {};
    private _listeners: any = {};
    private _selected: any = null;

    get all(): any {
        return this._all;
    }

    get wards(): any {
        return Object.values(this._all).filter((marker: any) => {
            return marker.component === 'ward';
        });
    }

    get users(): any {
        return Object.values(this._all).filter((marker: any) => {
            return marker.component === 'user';
        });
    }

    get goblins(): any {
        return Object.values(this._all).filter((marker: any) => {
            return marker.race === 'goblin';
        });
    }

    get scouts(): any {
        return Object.values(this._all).filter((marker: any) => {
            return marker.component === 'wolf';
        });
    }

    get selected(): User | Goblin | Ward | Scout | undefined {
        return this._selected;
    }

    @Mutation
    public async addMarker(data: { id: string; position: { lat: number; lng: number }; marker: any; refRoot: string }) {
        const subscribe = (root: string, marker: User | Goblin | Ward | Loot) => {
            Vue.set(this._all, marker.id, marker);

            if (!this._listeners[marker.id]) {
                this._listeners[marker.id] = firebase.db.ref(`${root}/${marker.id}`).on('child_changed', (s: any) => {
                    if (this._all[marker.id]) {
                        Vue.set(this._all[marker.id], s.key, s.val());
                        console.log(root + ' child changed: ', s.key, s.val());
                    }
                });
            }
        };

        switch (data.refRoot) {
            case 'users':
                subscribe(data.refRoot, new User(data.id, data.marker));
                break;
            case 'scouts':
                subscribe(data.refRoot, new Scout(data.id, data.marker));
                break;
            case 'npc':
                subscribe(data.refRoot, new Goblin(data.id, data.marker));
                break;
            case 'wards':
                subscribe(data.refRoot, new Ward(data.id, data.marker));
                break;
            case 'loot':
                subscribe(
                    data.refRoot,
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
                break;
            default:
                console.log('Can not subscribe to this refRoot', data.refRoot);
                break;
        }
    }

    @Mutation
    public removeMarker(id: string) {
        if (this._listeners[id] && this._listeners[id].off) {
            this._listeners[id].off();
        }
        Vue.delete(this._all, id);
    }

    @Mutation
    public select(id: number) {
        if (this._selected) {
            this._all[this._selected.id].selected = false;
        }
        this._selected = this._all[id];
        this._all[id].selected = true;
    }

    @Mutation
    public deselect() {
        if (this._selected && this._all[this._selected.id]) {
            this._all[this._selected.id].selected = false;
        }
        this._selected = null;
    }

    @Action
    public async spawnScout(account: Account) {
        const hash = Geohash.encode(account.position.lat, account.position.lng, 7);

        if (!account.scout) {
            const snap = await firebase.db.ref(`scouts/`).push();

            await firebase.db.ref(`scouts/${snap.key}`).set({
                hitPoints: 100,
                level: 1,
                name: `${account.name}'s scout`,
                race: 'wolf',
                uid: account.id,
                position: account.position,
            });

            await firebase.db.ref(`users/${account.id}/scout`).set(snap.key);

            await firebase.db.ref(`markers/${hash}/${snap.key}`).set({
                position: account.position,
                ref: `scouts/${snap.key}`,
            });
        } else {
            await firebase.db.ref(`markers/${hash}/${account.scout}`).set({
                position: account.position,
                ref: `scouts/${account.scout}`,
            });
            await firebase.db.ref(`scouts/${account.scout}/position`).set(account.position);
        }
    }

    @Action
    async spawnNpc(payload: { hash: string; position: { lat: number; lng: number }; race: string; level: number }) {
        const snap = await firebase.db.ref('markers').child(payload.hash).once('value');
        const count = Object.values(snap.val()).filter((marker: any) => {
            return marker.race === payload.race;
        }).length;

        // If less than 3 npcClass in geohash
        if (count < 2) {
            const goblin = {
                id: await firebase.db.ref('npc').push().key,
                hitPoints: 300,
                position: payload.position,
                race: payload.race,
                level: payload.level,
            };

            // Set in npc database
            firebase.db.ref(`npc/${goblin.id}`).set(goblin);
            firebase.db.ref(`markers/${payload.hash}/${goblin.id}`).set({
                ref: `npc/${goblin.id}`,
                race: payload.race,
                position: payload.position,
            });

            console.log(`A ${payload.race} is added to the database`, goblin);
        }
    }

    @Action
    public async init(firebaseUser: firebase.User) {
        firebase.db.ref(`users/${firebaseUser.uid}/hashes`).on('child_added', async (hashSnap: any) => {
            const hash = hashSnap.val();

            firebase.db.ref(`markers/${hash}`).on('child_added', async (markerSnap: any) => {
                const marker = markerSnap.val();
                const refRoot = marker.ref.split('/')[0];
                const refSnap = await firebase.db.ref(marker.ref).once('value');

                this.context.commit('addMarker', {
                    id: refSnap.key,
                    position: marker.position,
                    marker: refSnap.val(),
                    refRoot,
                });
                console.log(`Marker added for hash`, refSnap.key, hash);
            });

            firebase.db.ref(`markers/${hash}`).on('child_removed', async (markerSnap: any) => {
                const refSnap = await firebase.db.ref(markerSnap.val().ref).once('value');

                if (
                    refSnap.key !== firebaseUser.uid &&
                    refSnap.key !== this.context.rootGetters['account/account'].scout
                ) {
                    // Also skip removal of the wards here
                    this.context.commit('removeMarker', refSnap.key);
                }
            });
        });

        firebase.db.ref(`users/${firebaseUser.uid}/hashes`).on('child_removed', async (hashSnap: any) => {
            const markerSnap = await firebase.db.ref(`markers/${hashSnap.val()}`).once('value');
            const markers = markerSnap.val();
            const hash = hashSnap.val();

            // Stop listening for old marker reference
            firebase.db.ref(`markers/${hash}`).off();

            // If there are markers to remove remove them
            if (markers) {
                Object.keys(markers).forEach((key: string) => {
                    if (key !== firebaseUser.uid && key !== this.context.rootGetters['account/account'].scout) {
                        this.context.commit('removeMarker', key);
                    }
                });
            }
        });
    }
}

export default MarkersModule;
