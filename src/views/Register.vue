<template>
    <div class="row">
        <form class="form" v-on:submit.prevent="register" v-if="!loading">
            <h1>Nice to meet you!</h1>
            <h2>Authentication</h2>
            <div class="form-item">
                <input required type="text" v-model="email" class="input-text" placeholder="E-mail" />
            </div>
            <div class="form-item">
                <input required type="password" v-model="password" class="input-text" placeholder="******" />
            </div>
            <div class="form-item">
                <input required type="password" v-model="passwordVerify" class="input-text" placeholder="******" />
            </div>

            <h2>Personal</h2>
            <div class="form-item">
                <input required type="text" v-model="userName" class="input-text" placeholder="Username" />
            </div>

            <h2>Hero Race</h2>
            <div class="form-item">
                <input name="race" class="form-radio" id="class-human" type="radio" value="human" v-model="userRace" />
                <label for="class-knight">Human</label>
            </div>

            <h2>Hero Class</h2>
            <div class="form-item">
                <input
                    name="class"
                    class="form-radio"
                    id="class-knight"
                    type="radio"
                    value="knight"
                    v-model="userClass"
                />
                <label for="class-knight">Knight</label>
                <input
                    name="class"
                    class="form-radio"
                    id="class-archer"
                    type="radio"
                    value="archer"
                    v-model="userClass"
                />
                <label for="class-archer">Archer</label>
                <input
                    name="class"
                    class="form-radio"
                    id="class-wizard"
                    type="radio"
                    value="wizard"
                    v-model="userClass"
                />
                <label for="class-wizard">Wizard</label>
            </div>

            <h2>Position</h2>
            <div class="form-item" v-if="position">
                Lat: <strong>{{ position.latitude }}</strong
                ><br />
                Lng: <strong>{{ position.longitude }}</strong>
            </div>
            <div class="form-item" v-if="!position">
                Trying to get your position...
            </div>
            <button v-bind:disabled="!position" class="btn btn-primary" type="submit">Create account</button>
            <p class="align-center">or go back to <router-link to="/login">Login</router-link></p>
        </form>
    </div>
</template>
<script src="./Register.ts" lang="ts"></script>
