import Vuex from 'vuex';
import { Vue } from 'vue-property-decorator';
import { vuexfireMutations } from 'vuexfire';
import { config } from 'vuex-module-decorators';
// Set rawError to true by default on all @Action decorators
config.rawError = true;

import AccountStore from './modules/account';
import MapModule from './modules/map';
import UsersModule from './modules/users';
import MarkersModule from './modules/markers';
import InventoryModule from './modules/inventory';

Vue.use(Vuex);

const mutations = {
    ...vuexfireMutations,
};

const actions = {};
const getters = {};

const modules = {
    account: AccountStore,
    map: MapModule,
    users: UsersModule,
    markers: MarkersModule,
    inventory: InventoryModule,
};

export default new Vuex.Store({
    state: {},
    getters,
    mutations,
    actions,
    modules,
});
