<template>
    <main class="section-character" v-if="open">
        <!-- <section class="dialog dialog--store" v-if="storeController && storeController.store">
            <ul>
                <li :key="item.slug" v-if="item.amount > 0" v-for="item in storeController.stores[storeController.store].items">
                    <button v-bind:style="{ backgroundImage: `url(${assets[item.slug]})` }" v-bind:class="`btn btn-${item.slug}`" v-on:click="onGetItemFromStore(storeController.store, item)">
                        {{ item.name }}
                        <small>
                            {{ item.amount }}
                        </small>
                    </button>
                </li>
            </ul>
        </section> -->
        <section class="section-equipment">
            <div class="dialog dialog--stats" v-if="myUser">
                <h1>
                    <div v-bind:style="{ backgroundImage: 'url(' + assets[myUser.userClass] + ')' }" class="btn btn-avatar"></div>
                    <p>
                        <strong>{{myUser.username}}</strong><br />
                        Level {{myUser.exp}}
                    </p>
                </h1>
                <p>{{myUser.userClass}}</p>
            </div>
            <ul class="dialog dialog--equipment">
                <li :key="key" v-for="slot, key in itemController.equipment">
                    <span v-if="!slot.item">{{slot.slug}}</span>
                    <button v-if="slot.item" v-bind:style="{ backgroundImage: `url(${assets[slot.item.slug]})` }" v-bind:class="`btn btn-${slot.item.slug}`" v-on:click="onItemClick(slot.item)">
                        {{ slot.item.name }}
                    </button>
                </li>
            </ul>
        </section>
        <section class="section-inventory">
            <div class="dialog dialog--item">
                <div class="item-info" v-if="selectedItem">
                    <button v-bind:style="{ backgroundImage: `url(${assets[selectedItem.slug]})` }" v-bind:class="`btn btn-${selectedItem.slug}`">
                        {{ selectedItem.name }}
                    </button>
                    <h2>{{ selectedItem.name }}</h2>
                    <p>{{ selectedItem.description }}</p>
                </div>
            </div>
            <ul class="dialog dialog--inventory" v-if="itemController && itemController.loaded">
                <li :key="item.slug" v-if="(item.amount > 0)" v-for="item in itemController.inventory">
                    <button v-bind:style="{ backgroundImage: `url(${assets[item.slug]})` }" v-bind:class="`btn btn-${item.slug}`" v-on:click="onItemClick(item)">
                        {{ item.name }}
                        <small v-if="(item.amount > 1)">
                            {{ item.amount }}
                        </small>
                    </button>
                </li>
            </ul>
            <button class="btn btn-back" v-on:click="back()">Back</button>
        </section>
    </main>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth';

import StoreController from './controllers/StoreController'
import ItemController from './controllers/ItemController'

export default {
    name: 'character',
    data: function() {
        return {
            open: false,
            uid: firebase.auth().currentUser.uid,
            storeController: new StoreController(),
            itemController: new ItemController(),
            selectedItem: null,
            myUser: null,
            assets: {
                tools: require('./assets/img/tools.png'),
                ward: require('./assets/img/ward-1.png'),
                knight: require('./assets/img/knight-1.png'),
                archer: require('./assets/img/archer-1.png'),
                wizard: require('./assets/img/wizard-1.png'),
                scout: require('./assets/img/wolf-0.png'),
                gold: require('./assets/img/coin.png'),
                potion: require('./assets/img/potion.png'),
                sword: require('./assets/img/woodSword.png'),
                inventory: require('./assets/img/backpack.png'),
                inventoryOpen: require('./assets/img/backpack_open.png'),
                discover: require('./assets/img/discover.png')
            }
        }
    },
    mounted() {
        // this.items = this.itemController.inventory
    },
    methods: {
        back() {
            this.open = false
        },
        openInventory() {
            this.$router.replace('/character')
        },
        onItemClick(item) {
            this.cursorMode = 'equip'
            this.selectedItem = item
        },
        onSlotClick(slot) {
            if ((slot == null) && this.selectedItem != null) {

            }
        }
    }
}
</script>

<style scoped lang="scss">
@import url('./dialog.scss');
@import url('./button.scss');

$blue-dark: #2c3e50;

.section-character {
    z-index: 2;
    position: fixed;
    top: 0;
    left: 0;
    background: $blue-dark;
    height: 100%;
    width: 100%;
    color: white;
    display: flex;
}

@media (orientation: landscape) {
    .section-character {
        flex-direction: row;

        .section-equipment {
            flex: 0 50%;
        }

        .section-inventory {
            flex: 0 50%;
        }
    }
}

@media (orientation: portrait) {
    .section-character {
        flex-direction: column;
    }
}
.section-inventory {
    flex: 0 60%;
    padding: 1rem;
    display: flex;
    flex-direction: column;
}

.dialog--item {
    width: 100%;
    flex: 0 90px;
    padding: 1rem;
    margin-top: 0;
    margin-bottom: 1rem;

    .item-info {
        display: flex;

        .btn {
            flex: 0 60px;
            width: 60px;
            height: 60px;
            margin-right: 1rem;
        }

        h2 {
            color: white;
            font-size: 12px;
            margin: 0;
        }
    }
}

.dialog--inventory {
    flex: 0 110px;
    width: 100%;
    flex-direction: row;
    overflow: auto;
}

.dialog--inventory li {
    flex: 0 40px;
}

.btn-back {
    position: relative;
    width: 100%;
    flex: 0 15%;
    background: white;
    color: black;
    font-size: 12px;
    margin: 1rem 0 0;
}

.dialog {
    position: relative;
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
}

.dialog li {
    display: inline-block;
}

.section-equipment {
    flex: 0 40%;
    padding: 1rem;
    display: flex;
    flex-direction: row;
}

.dialog--stats {
    flex: 1 50%;
    padding: 1rem;
    margin-right: .5rem;
    flex-direction: column;

    p {
        margin: 0;
    }
}

.dialog--stats h1 {
    color: white;
    margin: 0;
    display: flex;
}

.dialog--stats h1 .btn {
    border-radius: 50%;
    flex: 0 auto;
    background-size: 60% auto;
}

.dialog--stats h1 p {
    font-size: 12px;
    padding: .4rem .5rem;
    margin: 0;
    font-weight: normal;
    color: gray;

    strong {
        font-size: 14px;
        font-weight: normal;
        color: white;
    }
}

.dialog--equipment {
    flex: 1 50%;
    margin-left: .5rem;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    overflow: auto;

    li {
        display: inline-flex;
        font-size: 8px;
        align-items: center;
        justify-content: center;
    }
}

</style>
