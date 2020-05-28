<template>
    <div class="account" v-if="account">
        <b-button class="btn-square">
            <img width="30" :src="imgAccountClass[account.class]" :alt="account.class" />
            <div class="level">
                {{ account.lvl }}
            </div>
        </b-button>
        <div class="account-info">
            <div class="user-name">
                <strong>{{ account.name }}</strong>
            </div>
            <b-progress class="user-hp" variant="success" :value="account.hp" :max="100" />
            <b-progress class="user-xp" :value="account.xp" :max="100" />
        </div>
    </div>
</template>
<script src="./BaseProfile.ts" lang="ts"></script>
<style scoped>
.account {
    display: flex;
    align-items: center;
    position: absolute;
    top: 1rem;
    left: 1rem;
    width: 100%;
    max-width: 200px;
}

.account .btn-square {
    flex: 0 60px;
    background-color: rgba(0, 0, 0, 0.5);
    border: 0;
    padding: 0.5rem;
    width: 60px;
    height: 60px;
    border: 2px solid #d19a66;
    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.account .btn-square .level {
    border: 2px solid #d19a66;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 11px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.75);
    color: white;
    font-weight: bold;
    position: absolute;
    bottom: -10px;
    left: -10px;
    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.account-info {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    color: white;
    font-family: Arial;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.account-info .user-hp,
.account-info .user-xp {
    height: 10px;
    margin-bottom: 0.25rem;
    width: 100%;
    font-size: 8px;
    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}
</style>
