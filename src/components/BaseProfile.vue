<template>
    <div class="account" v-if="account">
        <b-button class="btn-circle">
            <img width="30" :src="imgAccountClass[account.class]" :alt="account.class" />
        </b-button>
        <div class="level">
            {{ account.lvl }}
        </div>
        <div class="account-info">
            <div class="user-name">
                <strong>{{ account.name }}</strong>
            </div>
            <b-progress class="user-hp" variant="success" :value="account.hp" :max="100" />
            <b-progress class="user-xp" variant="warning" :value="account.xp" :max="100" />
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

.account .btn-circle {
    flex: 0 60px;
    margin-right: 0.5rem;
    background-color: rgba(0, 0, 0, 0.5);
    border: 0;
    border-radius: 50%;
    padding: 0.5rem;
    width: 60px;
    height: 60px;
    border: 2px solid #d19a66;
    box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.5);
    overflow: hidden;
}

.account .btn-circle img {
    transform: scale(2);
}

.account .level {
    border: 2px solid #d19a66;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 10px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.75);
    color: white;
    font-weight: bold;
    position: absolute;
    bottom: -2px;
    left: -2px;
    box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.5);
}

.account-info {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    color: white;
    font-family: Arial;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.account-info .user-hp {
    margin-bottom: 0.5rem;
}

.account-info .user-hp,
.account-info .user-xp {
    height: 8px;
    border-radius: 3px;
    margin-bottom: 0.25rem;
    width: 100%;
    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    background-color: rgba(0, 0, 0, 0.5);
}
</style>
