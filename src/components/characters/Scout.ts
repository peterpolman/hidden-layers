import { Component, Vue, Prop } from 'vue-property-decorator';
import { Scout } from '@/models/Scout';
import { BProgress } from 'bootstrap-vue';
import { mapGetters } from 'vuex';
import Geohash from 'latlon-geohash';
import firebase from '@/firebase';
import { BButton } from 'bootstrap-vue';

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
        ...mapGetters('map', {
            tb: 'tb',
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

    mounted() {
        this.$watch('marker.route', (route: any) => {
            this.travelTo(route);
        });
    }

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

            // this.$watch('marker.position', (position) => {
            //     this.updatePosition(position);
            // });
        });
    }

    updatePosition(position: { lat: number; lng: number }) {
        this.mesh.setCoords([position.lng, position.lat]);
        this.tb.repaint();
    }

    travelTo(route: any) {
        const latLngPath = this.tb.utils.lnglatsToWorld(route.options.path);
        const path = new THREE.CatmullRomCurve3(latLngPath);
        const timeProgress = (route.now - route.start) / route.options.duration;

        if (timeProgress < 1) {
            const point = path.getPointAt(timeProgress);
            const lngLat = this.tb.utils.unprojectFromWorld(point);
            const position = { lng: lngLat[0], lat: lngLat[1] };
            const oldHash = Geohash.encode(this.marker.position.lat, this.marker.position.lng, 7);
            const hash = Geohash.encode(position.lat, position.lng, 7);
            const tangent = path.getTangentAt(timeProgress).normalize();
            const axis = new THREE.Vector3(0, 0, 0);
            const up = new THREE.Vector3(0, 1, 0);
            const radians = Math.acos(up.dot(tangent));

            axis.crossVectors(up, tangent).normalize();

            // Point the object in the right direction
            this.mesh.setCoords([this.marker.position.lng, this.marker.position.lat]);
            this.mesh._setObject({ quaternion: [axis, radians] });
            this.tb.repaint();

            // Clears existing timer starts a new one
            window.clearTimeout(this.timer);
            this.timer = window.setTimeout(() => {
                // // Detect hash change for scout
                if (oldHash !== hash) {
                    // Remove the old record
                    firebase.db.ref(`markers/${oldHash}/${this.marker.id}`).remove();
                    firebase.db.ref(`markers/${hash}/${this.marker.id}`).update({
                        position: position,
                        ref: `scouts/${this.marker.id}`,
                    });
                }

                // Update the scout position and route progress in time
                firebase.db.ref(`scouts/${this.marker.id}`).update({ position: position });
                firebase.db
                    .ref(`scouts/${this.marker.id}/route`)
                    .update({ now: firebase.database.ServerValue.TIMESTAMP });
            }, 30);
        } else {
            firebase.db.ref(`scouts/${this.marker.id}/route`).remove();

            window.clearTimeout(this.timer);
        }
    }

    destroyed() {
        this.tb.remove(this.mesh);
        this.tb.repaint();
    }

    onClick() {
        this.map.setCenter([this.marker.position.lng, this.marker.position.lat]);
    }
}
