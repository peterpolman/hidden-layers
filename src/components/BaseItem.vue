<template>
    <span>
        <b-button :id="item.id" class="btn-square">
            <img class="image" :src="require(`../assets/img/${item.image}.png`)" :alt="item.name" />
            <div v-if="item.amount > 1" class="amount">
                {{ item.amount }}
            </div>
        </b-button>
        <b-popover :target="item.id" triggers="hover">
            <template v-slot:title>
                <small v-if="item.amount > 1">{{ item.amount }} x </small>
                <span :style="{ color: item.rarity.color }">{{ item.name }}</span>
                <small class="float-right">{{ item.slot }}</small>
            </template>
            <strong v-if="item.armor">{{ item.armor }} Armor</strong>
            <strong v-if="item.damage">{{ item.damage }} - {{ item.damage + 3 }} Damage</strong>
            <strong class="float-right" v-if="item.speed">Speed {{ item.speed }}</strong>
            <hr />
            <i v-if="item.description">{{ item.description }}</i>
            <hr />
            <div v-if="item.value > 0">
                <strong>{{ item.value }} </strong><img width="15" src="../assets/img/Coin.png" />
            </div>
            <hr />
            <b-button v-if="!equipped" variant="primary" block size="sm" @click="equip()">
                <span>Equip</span>
            </b-button>
            <b-button v-if="equipped" variant="primary" block size="sm" @click="unequip()">
                <span>Unequip</span>
            </b-button>
            <b-button v-if="dropable" variant="success" block size="sm" @click="drop()">
                <span>Drop</span>
            </b-button>
        </b-popover>
    </span>
</template>
<script src="./BaseItem.ts" lang="ts"></script>
<style scoped>
hr {
    margin: 0.25rem 0;
}
.image {
    height: 25px;
    width: auto;
}
</style>
