<template>
    <div class="inventory" v-if="inventory">
        <base-item :item="item" v-for="(item, key) of inventory" :key="key" />
    </div>
</template>
<script src="./BaseInventory.ts" lang="ts"></script>
<style scoped>
.inventory {
    display: inline-flex;
    padding: 0.25rem;
    background-color: rgba(0, 0, 0, 0.5);
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    width: auto;
}
</style>
