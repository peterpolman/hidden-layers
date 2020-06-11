import { Component, Vue, Prop } from 'vue-property-decorator';
import { Scout } from '@/models/Scout';
import { BProgress } from 'bootstrap-vue';
import { mapGetters } from 'vuex';
import Geohash from 'latlon-geohash';
import firebase from '@/firebase';
import { BButton } from 'bootstrap-vue';
import { Account } from '@/models/Account';
import MapboxGL from 'mapbox-gl';

const THREE = (window as any)['THREE'];
const ImgScout = {
    scout: require('../../assets/img/wolf-0.png'),
};

@Component({
    name: 'Scout',
    components: {
        'b-progress': BProgress,
        'b-button': BButton,
    },
    computed: {
        ...mapGetters('account', {
            account: 'account',
        }),
        ...mapGetters('map', {
            tb: 'tb',
            miniMap: 'miniMap',
        }),
    },
})
export default class CharacterScout extends Vue {
    @Prop() marker!: Scout;

    img = ImgScout.scout;
    tb: any;
    timer: any;
    mesh: any;
    map: any;
    miniMap: any;
    account!: Account;
    miniMapIcon: any;

    created() {
        const THREE = (window as any)['THREE'];
        const loader = new THREE.GLTFLoader();

        loader.load('./objects/wolf/wolf.gltf', (gltf: any) => {
            gltf.scene.scale.set(1.5, 1.5, 1.5);
            gltf.scene.rotation.z = 180 * 0.0174533;
            gltf.scene.userData = {
                id: this.marker.id,
                position: this.marker.position,
            };

            this.mesh = this.tb
                .Object3D({ obj: gltf.scene, units: 'meters' })
                .setCoords([this.marker.position.lng, this.marker.position.lat]);

            this.tb.add(this.mesh);
            this.tb.repaint();

            this.$watch('marker.position', (position, oldPosition) => {
                this.updatePosition(position, oldPosition);
            });

            this.$watch('marker.route', (route: any) => {
                if (route) {
                    this.travelTo(route);
                }
            });
        });
    }

    mounted() {
        const el = document.createElement('div');
        el.className = 'minimap-scout';

        this.miniMapIcon = new MapboxGL.Marker(el)
            .setLngLat([this.marker.position.lng, this.marker.position.lat])
            .addTo(this.miniMap);
    }

    async updatePosition(newP: { lat: number; lng: number }, oldP: { lat: number; lng: number }) {
        const oldHash = Geohash.encode(oldP.lat, oldP.lng, 7);
        const hash = Geohash.encode(newP.lat, newP.lng, 7);

        if (oldHash !== hash) {
            const hashes: { [hash: string]: string } = {};
            const neighbours = Geohash.neighbours(hash);

            for (const direction in neighbours) {
                const h = neighbours[direction];

                hashes[h] = h;
            }

            hashes[hash] = hash;

            firebase.db.ref(`markers/${oldHash}/${this.marker.id}`).remove();
            firebase.db.ref(`markers/${hash}/${this.marker.id}`).update({
                position: newP,
                ref: `scouts/${this.marker.id}`,
            });

            await firebase.db.ref(`scouts/${this.marker.id}/hashes`).set(hashes);
            await firebase.db.ref(`users/${this.account.id}/visibility`).set({
                ...this.account.hashes,
                ...hashes,
            });
        }

        this.miniMapIcon.setLngLat([newP.lng, newP.lat]);
        this.mesh.setCoords([newP.lng, newP.lat]);
        this.tb.repaint();
    }

    async travelTo(route: any) {
        const latLngPath = this.tb.utils.lnglatsToWorld(route.options.path);
        const path = new THREE.CatmullRomCurve3(latLngPath);
        const timeProgress = (route.now - route.start) / route.options.duration;

        if (timeProgress < 1) {
            const point = path.getPointAt(timeProgress);
            const lngLat = this.tb.utils.unprojectFromWorld(point);
            const position = { lng: lngLat[0], lat: lngLat[1] };

            await this.updateQuaternion(path, timeProgress);

            // Clears existing timer starts a new one
            window.clearTimeout(this.timer);

            if (this.account.scout === this.marker.id) {
                this.timer = window.setTimeout(() => {
                    // Update the scout position and route progress in time (deliberatly async)
                    firebase.db.ref(`scouts/${this.marker.id}`).update({ position: position });
                    firebase.db
                        .ref(`scouts/${this.marker.id}/route`)
                        .update({ now: firebase.database.ServerValue.TIMESTAMP });
                }, 30);
            }
        } else {
            firebase.db.ref(`scouts/${this.marker.id}/route`).remove();

            window.clearTimeout(this.timer);
        }
    }

    async updateQuaternion(path: any, timeProgress: number) {
        const tangent = path.getTangentAt(timeProgress).normalize();
        const axis = new THREE.Vector3(0, 0, 0);
        const up = new THREE.Vector3(0, 1, 0);
        const radians = Math.acos(up.dot(tangent));

        axis.crossVectors(up, tangent).normalize();

        this.mesh._setObject({ quaternion: [axis, radians] });
        this.tb.repaint();
    }

    destroyed() {
        this.tb.remove(this.mesh);
        this.tb.repaint();
        this.miniMapIcon.remove();
    }

    onClick() {
        this.map.setCenter([this.marker.position.lng, this.marker.position.lat]);
    }
}
