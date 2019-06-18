<template>
    <div class="panel panel-default panel-messages" ref="messageWrapper">
        <ul class="list" v-if="stream">
            <li class="list-item" :key="message.key" v-for="message in stream">
                <p><span class="message-date">[{{message.date}}] </span><strong>{{message.name}}</strong> {{ message.content }}</p>
            </li>
        </ul>
    </div>
</template>
<script>
import firebase from 'firebase/app';

export default {
    name: 'Messages',
    props: ['messages'],
    data() {
        return {
            publicMessages: [],
            privateMessages: [],
            stream: [],
            messagesPublicRef: firebase.database().ref('messages').child('public'),
            messagesPrivateRef: firebase.database().ref('messages').child(firebase.auth().currentUser.uid),
        }
    },
    mounted() {
        this.messagesPublicRef.on('child_added', async (snap) => {
            let message = snap.val();
            message['name'] = await this.getUserName(snap.val().uid);
            message['date'] = this.getDateAndTime(snap.val().timestamp);

            this.updateList(message, 'public');
        });

        this.messagesPrivateRef.on('child_added', async (snap) => {
            let message = snap.val();
            message['name'] = await this.getUserName(snap.val().uid);
            message['date'] = this.getDateAndTime(snap.val().timestamp);

            this.updateList(message, 'private');
        });
    },
    methods: {
        updateList(message, type) {
            this.stream.push(message);
            this.stream.sort((a, b) => (a.timestamp > b.timestamp) ? 1 : -1)

            window.setTimeout(() => {
                this.$refs.messageWrapper.scrollTop = this.$refs.messageWrapper.scrollHeight;
                console.log(`Message added to ${type}`, message);
            }, 50);
        },
        getDateAndTime(timestamp) {
            const d = new Date(timestamp + 3600); // GMT + 1
            let dd = d.getDay();
            let MM = d.getMonth();
            let hh = d.getHours();
            let mm = d.getMinutes();
            let yy = d.getFullYear();

            if (dd < 10) dd = '0' + dd;
            if (MM < 10) MM = '0' + MM;
            if (hh < 10) dd = '0' + dd;
            if (mm < 10) mm = '0' + mm;

            return `${MM}/${dd}/${yy} ${hh}:${mm}`;
        },
        getUserName(uid) {
            return new Promise((resolve) => {
                if (uid !== null) {
                    firebase.database().ref(`users/${uid}`).once('value').then((s) => {
                        resolve(s.val().name)
                    });
                }
            });
        }
    }
}
</script>
<style scoped>
    .panel-messages {
        padding: 0;
        overflow: auto;
        background: transparent;
        box-shadow: none;
    }
    .list {
        padding: 0 .5rem;
        width: 100%;
        margin: 0;
        height: 100%;
    }
    .list-item {
        width: 100%;
        margin: 0;
        height: auto;
        background: transparent;
    }
    .list-item:first-child {
        margin-top: .5rem;
    }
    .list-item:last-child {
        margin-bottom: .5rem;
    }
    .list-item p {
        font-size: 10px;
        color: white;
        margin: 0;
        font-weight: bold;
    }
    .list-item p strong {
        color: #999999;
    }
    .message-date {
        color: #999999;
        font-weight: normal;
    }
    .panel-input {
        position: fixed;
        bottom: 0;
    }
</style>
