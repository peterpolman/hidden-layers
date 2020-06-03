<template>
    <b-modal :id="id" no-fade hide-backdrop hide-footer hide-header centered @hidden="$emit('close')" :title="title">
        <header>
            <strong class="modal-title">{{ title }}</strong>
            <b-button class="close" @click="close()">
                <span>×</span>
            </b-button>
        </header>
        <b-overlay :show="loading" no-wrap></b-overlay>
        <slot name="content"> </slot>
    </b-modal>
</template>

<script src="./BaseModal.ts" lang="ts"></script>
