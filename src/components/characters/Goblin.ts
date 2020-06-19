import { Component, Vue, Prop } from 'vue-property-decorator';
import { Goblin } from '@/models/Enemies';
import BaseCharacter from '@/components/BaseCharacter.vue';
import { BProgress, BButton } from 'bootstrap-vue';
import MapboxGL from 'mapbox-gl';
import { mapGetters } from 'vuex';
import { Account } from '@/models/Account';

const THREE = (window as any)['THREE'];
const ImgGoblin = {
    goblin: require('../../assets/img/goblin-1.png'),
};

@Component({
    name: 'Goblin',
    components: {
        'base-character': BaseCharacter,
        'b-progress': BProgress,
        'b-button': BButton,
    },
    computed: {
        ...mapGetters('account', {
            account: 'account',
        }),
        ...mapGetters('map', {
            map: 'map',
            miniMap: 'miniMap',
            tb: 'tb',
            mixers: 'mixers',
        }),
    },
})
export default class CharacterGoblin extends Vue {
    @Prop() marker!: Goblin;

    img = ImgGoblin.goblin;
    map: any;
    miniMapIcon: any;
    miniMap: any;
    tb: any;
    mesh: any;
    account!: Account;
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
    loader = new THREE.GLTFLoader();
    moveTween: any;
    hitTimer: any;
    hit: any;
    start = 0;
    timer: any;

    created() {
        const el = document.createElement('div');

        el.className = 'minimap-goblin';

        this.miniMapIcon = new MapboxGL.Marker(el)
            .setLngLat([this.marker.position.lng, this.marker.position.lat])
            .addTo(this.miniMap);

        this.loader.load('./objects/goblin/goblin.gltf', (gltf: any) => {
            gltf.scene.scale.set(1.5, 1.5, 1.5);
            gltf.scene.userData = {
                id: this.marker.id,
                position: this.marker.position,
            };
            gltf.scene.rotation.z = Math.floor(Math.random() * 360);

            this.mesh = this.tb
                .Object3D({ obj: gltf.scene, units: 'meters' })
                .setCoords([this.marker.position.lng, this.marker.position.lat]);

            this.tb.add(this.mesh);

            this.mesh.visible = this.marker.visible;

            this.tb.repaint();

            this.$watch('marker.visible', (visible) => {
                this.updateVisibility(visible);
            });

            this.$watch('marker.position', (position: { lat: number; lng: number }) => {
                this.updatePosition(position);
            });

            this.$watch('marker.quaternion', (quaternion: any) => {
                this.updateQuaternion(quaternion);
            });

            this.$watch('marker.hitPoints', (newHP: number, oldHP: number) => {
                this.updateHitpoints(newHP, oldHP);
            });

            this.$watch('marker.selected', (selected) => {
                return selected ? this.talk() : null;
            });
        });
    }

    async updatePosition(position: { lat: number; lng: number }) {
        this.miniMapIcon.setLngLat([position.lng, position.lat]);
        this.mesh.setCoords([position.lng, position.lat]);
        this.tb.repaint();
    }

    async updateQuaternion(quaternion: any) {
        this.mesh._setObject({ quaternion: quaternion });
        this.tb.repaint();
    }

    updateVisibility(visible: boolean) {
        if (this.tb) {
            this.mesh.visible = visible;
            this.tb.repaint();
        }
    }

    updateHitpoints(newHP: number, oldHP: number) {
        const propValue = newHP - oldHP;
        const color = newHP > oldHP ? 'heal' : 'dmg';

        this.showImpact(propValue, color);
    }

    showImpact(propValue: number, color: string) {
        const el = document.createElement('div');

        el.classList.add(color);
        el.classList.add('character-hit');
        el.innerText = propValue.toString();

        if (this.hit) {
            this.hit.remove();
        }

        this.hit = new MapboxGL.Marker(el)
            .setLngLat([this.marker.position.lng, this.marker.position.lat])
            .addTo(this.map);

        this.hitTimer = window.setTimeout(() => {
            this.hit.remove();
            window.clearTimeout(this.hitTimer);
        }, 300);
    }

    move(position: { lat: number; lng: number }) {
        const distanceVector = (vec1: any, vec2: any) => {
            const dx = vec1.x - vec2.x;
            const dy = vec1.y - vec2.y;
            const dz = vec1.z - vec2.z;

            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        };
        const targetPosition = this.tb.projectToWorld([position.lng, position.lat]);
        const distance = distanceVector(this.mesh.position, targetPosition);
        const duration = distance * 1000;
        const latLngPath = this.tb.utils.lnglatsToWorld([
            [this.marker.position.lng, this.marker.position.lat],
            [position.lng, position.lat],
        ]);
        const path = new THREE.CatmullRomCurve3(latLngPath);

        window.clearTimeout(this.timer);

        this.start = new Date().getTime();

        this.timer = window.setInterval(() => {
            const timeProgress = (new Date().getTime() - this.start) / duration;
            const distance = distanceVector(this.mesh.position, targetPosition);

            if (distance > 0.5) {
                this.updateRoute(path, timeProgress);
            } else {
                window.clearTimeout(this.timer);
            }
        }, 30);
    }

    updateRoute(path: any, timeProgress: any) {
        const point = path.getPointAt(timeProgress);
        const lngLat = this.tb.utils.unprojectFromWorld(point);
        const position = { lng: lngLat[0], lat: lngLat[1] };
        const tangent = path.getTangentAt(timeProgress).normalize();
        const axis = new THREE.Vector3(0, 0, 0);
        const up = new THREE.Vector3(0, 1, 0);
        const radians = Math.acos(up.dot(tangent));

        axis.crossVectors(up, tangent).normalize();

        this.$store.dispatch('markers/setPosition', { id: this.marker.id, position });
        this.$store.dispatch('markers/setQuaternion', { id: this.marker.id, quaternion: [axis, radians] });
    }

    talk() {
        const greeting = this.greetings[Math.floor(Math.random() * this.greetings.length)];

        this.showSpeech(greeting);
    }

    showSpeech(speech: string) {
        const el = document.createElement('div');

        el.className = 'speech-bubble';
        el.innerText = speech;

        this.reset();

        this.speechMarker = new MapboxGL.Marker(el)
            .setLngLat([this.marker.position.lng, this.marker.position.lat])
            .addTo(this.map);

        this.speechMarkerTimer = window.setTimeout(() => {
            this.reset();
            this.move(this.account.position);
        }, 2000);
    }

    reset() {
        if (this.speechMarker) {
            window.clearTimeout(this.speechMarkerTimer);

            this.speechMarker.remove();
        }
    }

    destroyed() {
        if (this.hit) {
            this.hit.remove();
        }

        this.miniMapIcon.remove();

        this.tb.remove(this.mesh);
        this.tb.repaint();
    }
}
