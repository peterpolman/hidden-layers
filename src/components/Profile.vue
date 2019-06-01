<template>
    <div>
        <img src.bind="wiz" alt="" />
    </div>
</template>

<script>
import firebase from 'firebase/app';

export default {
    name: 'Profile',
    props: ['markers'],
    data() {
        return {
        }
    },
    mounted() {

    }
}
</script>

<style scoped>
</style>
