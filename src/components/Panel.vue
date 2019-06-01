<template>
    <div class="panel panel-default">
        <ul>
            <li :key="item" v-for="item in items"> -->
                <button class="btn btn-">
                <!-- v-bind:style="{ backgroundImage: `url(${assets[item.slug]})` }"
                v-bind:class="`btn btn-${item.slug}`"
                v-on:click="onItemClick(item)">
                    {{ item.name }}
                    <small v-if="(item.amount > 1)">
                        {{ item.amount }}
                    </small> -->
                </button>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'Panel',
    props: {
        // items: items
    },
    data() {
        return {
            items: this.$refs.items
        }
    },
    mounted() {

    },
    methods: {
        onItemClick(item) {
            console.log(item);
        }
    }
}
</script>

<style scoped>
    .panel {
        border-radius: 2px;
        position: fixed;
        margin: auto;
        display: block;
        background: rgba(0,0,0,0.4);
        box-shadow: rgba(0, 0, 0, 0.3) 0 1px 4px -1px;
        padding: 5px;
    }

    .panel ul {
        margin: 0;
        list-style: none;
        padding: 0;
        display: flex;
        width: 100%;
        flex-wrap: wrap;
        display: flex;
        flex-wrap: wrap;
    }

    .panel li {
        margin: 5px;
        border-radius: 2px;
        width: 40px;
        height: 40px;
        background-color: rgba(0,0,0,0.5);
        display: block;
    }

    .panel .btn {
        flex: 0 auto;
        position: relative;
        margin: 0;
    }
</style>
