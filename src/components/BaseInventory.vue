<template>
    <div class="ui-inventory">
        <b-button class="btn-square" @click="open()">
            <img class="image" :src="img[isOpen ? 'backpackOpen' : 'backpack']" />
        </b-button>
        <b-button class="btn-square" @click="spawnScout()">
            <img class="image" :src="img.scout" />
        </b-button>
        <base-modal @close="isOpen = false" title="Inventory" id="inventory" v-if="inventory">
            <div slot="content">
                <div class="modal-inventory">
                    <draggable :options="{ delay: 100 }" v-model="inventory" ghost-class="item-sortable">
                        <base-item
                            v-for="item of inventory"
                            :equipped="false"
                            :dropable="true"
                            :item="item"
                            :key="item.id"
                        />
                    </draggable>
                </div>
            </div>
        </base-modal>
    </div>
</template>
<script src="./BaseInventory.ts" lang="ts"></script>
<style scoped>
.btn-square {
    padding: 0.25rem;
}
.btn-square .image {
    height: 35px;
}
.ui-inventory {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
}
.modal-inventory {
    display: inline-flex;
    padding: 0.25rem;
    width: auto;
}
</style>
