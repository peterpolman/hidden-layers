<template>
    <router-view></router-view>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth';
export default {
    data() {
        return {
            currentUser: firebase.auth().currentUser
        }
    }
}
</script>
