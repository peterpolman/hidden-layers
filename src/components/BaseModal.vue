<template>
    <b-modal
        :id="id"
        no-fade
        stacking
        no-close-on-backdrop
        hide-backdrop
        hide-footer
        hide-header
        centered
        @hidden="$emit('close')"
        :title="title"
    >
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
<style scroped>
.modal-content {
    padding: 0;
}
.modal-body {
    padding: 0;
}
.modal-title {
    color: #d19a66;
    letter-spacing: 1px;
    font-weight: bold;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
    padding-left: 0.25rem;
    font-size: 14px;
    text-transform: uppercase;
    font-family: 'Alice';
}
header {
    padding: 0.25rem;
    border-bottom: 1px solid #d19a66;
    margin-bottom: 0.25rem;
}
.btn.close {
    background-color: #650703 !important;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
    width: 21px;
    height: 21px;
    color: #d19a66;
    padding: 0;
    opacity: 1;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    position: relative;
}
.close span {
    position: absolute;
    top: 0px;
    left: 4px;
    font-size: 20px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
.modal-content {
    background-color: rgba(0, 0, 0, 0.75);
}
</style>
