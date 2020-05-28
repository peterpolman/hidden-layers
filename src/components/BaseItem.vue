<template>
    <b-button class="btn-square" :title="item.name">
        <img class="image" :src="img[item.slug]" :alt="item.name" />
        <div class="amount">
            {{ item.amount }}
        </div>
    </b-button>
</template>
<script src="./BaseItem.ts" lang="ts"></script>
<style scoped>
.image {
    width: 25px;
    height: auto;
}

.amount {
    width: auto;
    height: 15px;
    background: black;
    color: white;
    padding: 0.25rem;
    font-weight: bold;
    line-height: 0;
    font-size: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: -1px;
    bottom: -1px;
    border-top-left-radius: 4px;
    border-bottom-right-radius: 4px;
}
</style>
