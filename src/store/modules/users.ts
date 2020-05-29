import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { Vue } from 'vue-property-decorator';

import { User } from '@/models/User';
import firebase from '@/firebase';

export interface UsersModuleState {
    users: { [uid: string]: User };
}

@Module({ namespaced: true })
class UsersModule extends VuexModule implements UsersModuleState {
    public _users: { [uid: string]: User } = {};

    get users() {
        return this._users;
    }

    @Mutation
    public addUser(user: User) {
        Vue.set(this._users, user.uid, user);
    }

    @Mutation
    public setUser(mutation: any) {
        mutation.updates.map((key: string, value: any) => {
            Vue.set(this._users[mutation.updates.uid], key, value);
        });
    }

    @Mutation
    public removeUser(user: User) {
        Vue.delete(this._users, user.uid);
    }

    @Action
    public async init(firebaseUser: any) {
        const usersRef = firebase.db.ref(`users`);

        usersRef.on('child_added', async (s) => {
            const user = new User(s.val().uid, s.val());

            this.context.commit('addUser', user);
        });

        usersRef.on('child_changed', async (s) => {
            this.context.commit('setUser', {
                uid: s.val().uid,
                update: {
                    key: s.key,
                    value: s.val(),
                },
            });
        });

        usersRef.on('child_removed', async (s) => {
            this.context.commit('removeUser', s.val().uid);
        });
    }

    @Action
    public async updateUser(uid: string, updates: any) {
        await firebase.db.ref(`users/${uid}`).update(updates);
    }
}

export default UsersModule;
