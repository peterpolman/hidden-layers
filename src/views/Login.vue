<template>
    <form class="form" v-on:submit.prevent="login" v-if="!loading">
        <h1>Enter your details</h1>
        <div class="form-item">
            <input required type="text" v-model="email" class="input-text" placeholder="E-mail" />
        </div>
        <div class="form-item">
            <input required type="password" v-model="password" class="input-text" placeholder="******" />
        </div>
        <button class="btn btn-primary" type="submit">Login</button>
        <p class="align-center">
            you don't have an account? You can <router-link to="/register">register one!</router-link>
        </p>
    </form>
</template>
<script src="./Login.ts" lang="ts"></script>
