<template>
    <div class="h-100 d-flex align-items-center justify-content-center container">
        <b-spinner variant="primary" v-if="loading"></b-spinner>
        <form v-else class="form mt-3" v-on:submit.prevent="register">
            <h1>Nice to meet you!</h1>
            <h2>Authentication</h2>
            <div class="form-group">
                <input
                    required
                    type="text"
                    v-model="email"
                    class="form-control"
                    placeholder="E-mail"
                />
            </div>
            <div class="form-group">
                <input
                    required
                    type="password"
                    v-model="password"
                    class="form-control"
                    placeholder="******"
                />
            </div>
            <div class="form-group">
                <input
                    required
                    type="password"
                    v-model="passwordVerify"
                    class="form-control"
                    placeholder="******"
                />
            </div>

            <h2>Personal</h2>
            <div class="form-group">
                <input
                    required
                    type="text"
                    v-model="userName"
                    class="form-control"
                    placeholder="Username"
                />
            </div>

            <h2>Hero Race</h2>
            <div class="form-group">
                <input
                    name="race"
                    class="form-radio"
                    id="class-human"
                    type="radio"
                    value="human"
                    v-model="userRace"
                />
                <label for="class-knight">Human</label>
            </div>

            <h2>Hero Class</h2>
            <div class="form-group">
                <div class="form-check form-check-inline">
                    <input
                        name="class"
                        class="form-radio"
                        id="class-knight"
                        type="radio"
                        value="knight"
                        v-model="userClass"
                    />
                    <label for="class-knight">Knight</label>
                </div>
                <div class="form-check form-check-inline">
                    <input
                        name="class"
                        class="form-radio"
                        id="class-archer"
                        type="radio"
                        value="archer"
                        v-model="userClass"
                    />
                    <label for="class-archer">Archer</label>
                </div>
                <div class="form-check form-check-inline">
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
            </div>

            <h2>Position</h2>
            <div class="form-group" v-if="coords">
                Lat:
                <strong>{{ coords.lat }}</strong>
                <br />Lng:
                <strong>{{ coords.lng }}</strong>
            </div>
            <div class="form-group" v-if="!coords">Trying to get your position...</div>
            <b-button
                :disabled="!coords"
                variant="primary"
                block
                class="mt-3"
                type="submit"
            >Create account</b-button>
            <p>
                ... or go back to
                <router-link to="/login">Login</router-link>
            </p>
        </form>
    </div>
</template>
<script src="./Register.ts" lang="ts"></script>
<style scoped>
.btn-primary {
    height: 40px;
    font-size: 16px;
    margin-bottom: 1rem;
}
.d-flex {
    overflow: auto;
}
</style>
