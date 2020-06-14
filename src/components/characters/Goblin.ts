import { Component, Vue, Prop } from 'vue-property-decorator';
import { Goblin } from '@/models/Enemies';
import BaseCharacter from '@/components/BaseCharacter.vue';
import { BProgress } from 'bootstrap-vue';
import MapboxGL from 'mapbox-gl';
import { mapGetters } from 'vuex';

const ImgGoblin = {
    goblin: require('../../assets/img/goblin-1.png'),
};

@Component({
    name: 'Goblin',
    components: {
        'base-character': BaseCharacter,
        'b-progress': BProgress,
    },
    computed: {
        ...mapGetters('map', {
            miniMap: 'miniMap',
            map: 'map',
        }),
    },
})
export default class CharacterGoblin extends Vue {
    @Prop() marker!: Goblin;

    img = ImgGoblin.goblin;
    map: any;
    miniMapIcon: any;
    miniMap: any;
    speechMarker: any;
    speechMarkerTimer: any;
    greetings = [
        'I got what you need.',
        'Got the best deals anywheres.',
        'Can I lighten up that coin purse for ya?',
        'You break it, you buy it.',
        "I ain't got it, you don't want it.",
        'Cha-ching!',
        'Have I got a deal for you.',
        'This stuff sells itself.',
        'I know a buyer when I see one.',
        "I ain't getting paid to chat.",
        'Smart mouth, huh?',
        'Heheh, big shot huh?',
        "It's my way or the highway, pal!",
        'No loitering, whatever that means.',
        'I got no respect around here.',
        'You looking at me?',
        'Yo, can I help you with something?',
        "What's the word on the street?",
        'Yeah, yeah.',
        "I've seen you around here before?",
        "What's shaking?",
        'G.T.L, friend: Gambling, Tinkering, Laundry!',
        'Wazzup?',
        'Yeah, what ya want?',
        'Well, spit it out!',
        'Heeey, how ya doing?',
        'Yo!',
        "Don't waste my time!",
        'What!?',
        'Quickly, quickly!',
        'Go, go!',
        'Make sense!',
    ];
    greeting = '';

    mounted() {
        const el = document.createElement('div');
        el.className = 'minimap-goblin';

        this.miniMapIcon = new MapboxGL.Marker(el)
            .setLngLat([this.marker.position.lng, this.marker.position.lat])
            .addTo(this.miniMap);

        this.$watch('marker.selected', (selected) => (selected ? this.greet() : null));
    }

    greet() {
        const greeting = this.greetings[Math.floor(Math.random() * this.greetings.length)];
        const el = document.createElement('div');

        el.className = 'speech-bubble';
        el.innerText = greeting;

        this.reset();

        this.speechMarker = new MapboxGL.Marker(el)
            .setLngLat([this.marker.position.lng, this.marker.position.lat])
            .addTo(this.map);

        this.speechMarkerTimer = window.setTimeout(() => this.reset(), 5000);
    }

    reset() {
        if (this.speechMarker) {
            window.clearTimeout(this.speechMarkerTimer);

            this.speechMarker.remove();
        }
    }

    destroyed() {
        this.miniMapIcon.remove();
    }
}
