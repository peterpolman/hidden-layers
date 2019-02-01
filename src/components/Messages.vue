<template>
    <section v-if="messageController && $parent.userController">
        <ul class="messages">
            <li :key="message.key" v-for="message of messageController.messages">
                <span>[{{ messageController.getDateTime(message.timestamp) }}]</span>
                <strong v-if="$parent.userController.userNames[message.uid]">{{ $parent.userController.userNames[message.uid] }}:</strong>
                <span>{{ message.message }}</span>
            </li>
        </ul>
    </section>
</template>

<script>
import MessageController from '../controllers/MessageController'

export default {
    name: 'messages',
    data() {
        return {
            messageController: null,
        }
    },
    mounted() {
        this.messageController = new MessageController()
    },
    methods: {

    }
}
</script>

<style scoped lang="scss">

.messages {
    position: fixed;
    top: 0;
    left: 0;
    width: auto;
    width: calc(100% - 75px);
    height: 55px;
    overflow: auto;
    margin: 0;
    padding: 3px 10px;
    transition: 0.5s background-color ease;

    &:hover {
        background-color: rgba(0,0,0,0.5);
    }

    li {
        line-height: 1;
        font-size: 9px;
        text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
        color: white;
        margin: 0;
        display: block;
    }
}

</style>
