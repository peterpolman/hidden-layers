<template>
    <main class="section-character">
        <section class="section-store">
            store
        </section>
        <section class="section-equipment">
            equip
        </section>
        <section class="section-inventory">
            inventory
        </section>
    </main>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth';

export default {
    name: 'inventory',
    data: function() {
        return {

        }
    },
    mounted() {

    },
    methods: {

    }
}
</script>

<style scoped lang="scss">
.section-character {
    background: black;
    height: 100%;
}
</style>
