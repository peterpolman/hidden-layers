<template>
    <div class="h-100 d-flex align-items-center justify-content-center">
        <b-spinner variant="primary" v-if="loading"></b-spinner>
        <form v-on:submit.prevent="login" v-else>
            <h1>Enter your details</h1>
            <input required type="text" v-model="email" class="form-control" placeholder="E-mail" />
            <input required type="password" v-model="password" class="form-control" placeholder="******" />
            <b-button block variant="primary" type="submit"><span>Login</span></b-button>
            <p>... don't have an account? You should <router-link to="/register">register one!</router-link></p>
        </form>
    </div>
</template>
<script src="./Login.ts" lang="ts"></script>
<style scoped>
.btn-primary {
    height: 40px;
    font-size: 16px;
    margin-bottom: 1rem;
}
</style>
