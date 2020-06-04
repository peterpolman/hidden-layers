<template>
    <base-modal @close="isOpen = false" title="Equipment" id="equipment" style="max-width: 200px;">
        <div slot="content">
            <div class="modal-equipment">
                <div class="btn-slot" v-for="(item, name) of equipment" :key="name">
                    <base-item
                        v-if="item"
                        :equipped="true"
                        :dropable="false"
                        :id="item.id"
                        :item="item"
                        :key="item.id"
                    />
                    <small v-else>
                        {{ name }}
                    </small>
                </div>
            </div>
        </div>
    </base-modal>
</template>
<script src="./BaseEquipment.ts" lang="ts"></script>
<style scoped>
.btn-square {
    padding: 0.25rem;
}
.btn-square .image {
    height: 35px;
}
.btn-slot {
    background: red;
    width: 60px;
    height: 60px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 5px;
    margin: 0 5px 5px 5px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    font-size: 12px;
    color: white;
}
.btn-slot .btn-square {
    margin: 5px;
}

.modal-equipment {
    display: inline-block;
    padding: 0.25rem;
    width: 100%;
    text-align: center;
}
</style>
