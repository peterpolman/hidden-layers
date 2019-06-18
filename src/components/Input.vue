<template>
    <div>
        <button
            class="btn btn-image btn-toggle"
            v-bind:style="`background-image: url(${imgChat});`"
            v-on:click="toggleChatOpen()">
            Chat
        </button>
        <form v-on:submit.prevent="onSubmit" class="message-form" v-show="isOpen">
            <input type="text" v-model="message" class="input input-text" ref="messageInput" maxlength="50" autofocus />
            <button class="btn" type="submit" v-on:click="onSubmit">SEND</button>
        </form>
    </div>
</template>

<script>
import firebase from 'firebase/app';
import EventService from '../services/EventService';

export default {
    name: 'Messages',
    data() {
        return {
            ea: new EventService(),
            isOpen: false,
            imgChat: require('../assets/img/chat.png'),
            message: "",
            messagesPublicRef: firebase.database().ref('messages/public'),
            messagesPrivateRef: firebase.database().ref(`messages/${firebase.auth().currentUser.uid}`),
        }
    },
    mounted() {
        document.onkeydown = (evt) => {
            evt = evt || window.event;
            var isEscape = false;
            if ("key" in evt) {
                isEscape = (evt.key === "Escape" || evt.key === "Esc");
            } else {
                isEscape = (evt.keyCode === 27);
            }
            if (isEscape) {
                this.isOpen = false;
            }
        };

        this.ea.listen('message.send', this.onReceive)
    },
    methods: {
        toggleChatOpen() {
            this.isOpen = !this.isOpen;
            if (this.isOpen) {
                this.$nextTick(() => this.$refs.messageInput.focus())
            }
        },
        onReceive(data) {
            let message = data.detail;
            message['timestamp'] = firebase.database.ServerValue.TIMESTAMP,
            message['id'] = this.messagesPublicRef.push().key,

            this.messagesPublicRef.child(message.id).set(message);
        },
        onSubmit() {
            if (this.message !== "") {
                const message = {
                    timestamp: firebase.database.ServerValue.TIMESTAMP,
                    id: this.messagesPublicRef.push().key,
                    content: this.message,
                    uid: firebase.auth().currentUser.uid,
                }
                this.messagesPublicRef.child(message.id).set(message);

                this.message = "";
                this.isOpen = false;
            }
        },
    }
}
</script>

<style scoped>
    .btn-toggle {
        position: absolute;
        background-size: 70% 70%;
        box-shadow: rgba(0, 0, 0, 0.3) 0 1px 4px -1px;
        right: 2px;
        bottom: 0px;
    }

    .message-form {
        display: flex;
    }

    .message-form .input-text {
        margin: 0;
        padding-right: 44px;
    }

    .message-form .btn {
        position: absolute;
        right: 0;
        top: 0;
        border: 0;
        background: none;
        height: 100%;
        color: #fdc539;
        font-weight: bold;
    }
</style>
