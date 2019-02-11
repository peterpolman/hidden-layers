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
    bottom: 10px;
    left: 0;
    width: calc(100% - 80px);
    height: 70px;
    overflow: auto;
    margin: 0;
    padding: 3px 10px;
    transition: 0.5s background-color ease;
    opacity: .5;

    &:hover {
        opacity: 1;
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
