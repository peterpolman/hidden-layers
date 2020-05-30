<template>
    <div class="profile" v-if="account">
        <b-button @click="onProfileClick()" class="btn-circle">
            <img width="30" :src="imgAccountClass[account.class]" :alt="account.class" />
        </b-button>
        <div class="profile-level">
            {{ account.lvl }}
        </div>
        <div class="profile-info">
            <div class="profile-name">
                <strong>{{ account.name }}</strong>
            </div>
            <div class="profile-progress">
                <b-progress class="profile-hp" variant="success" :value="account.hp" :max="100" />
                <b-progress class="profile-xp" variant="warning" :value="account.xp" :max="100" />
            </div>
        </div>
    </div>
</template>
<script src="./BaseProfile.ts" lang="ts"></script>
