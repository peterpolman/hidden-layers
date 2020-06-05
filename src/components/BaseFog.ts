import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { Account } from '@/models/Account';
import { Ward } from '@/models/Ward';

const THREE = (window as any)['THREE'];
const JSTS = require('jsts');

@Component({
    name: 'BaseFog',
    computed: {
        ...mapGetters('account', {
            account: 'account',
        }),
        ...mapGetters('map', {
            tb: 'tb',
        }),
        ...mapGetters('markers', {
            wards: 'wards',
        }),
    },
})
export default class BaseFog extends Vue {
    account!: Account;
    tb!: any;
    planeShape!: any;
    fog!: any;
    wards!: Ward[];

    get wardPositions() {
        return this.wards.map((ward: Ward) => {
            return ward.position;
        });
    }

    mounted() {
        const ne = this.tb.utils.projectToWorld([180, 85]);
        const sw = this.tb.utils.projectToWorld([-180, -85]);

        this.planeShape = this.createPlane(ne, sw, 5);

        this.updateFog([this.account.position].concat(this.wardPositions));

        this.$watch('account.position', () => {
            this.updateFog([this.account.position].concat(this.wardPositions));
        });

        this.$watch('wardPositions', () => {
            this.updateFog([this.account.position].concat(this.wardPositions));
        });
    }

    jstsPoly(path: any) {
        const geometryFactory = new JSTS.geom.GeometryFactory();
        const jstsPath = this.convertToJSTSPath(path);
        const linearRing = geometryFactory.createLinearRing(jstsPath);

        return geometryFactory.createPolygon(linearRing);
    }

    convertToJSTSPath(boundaries: any) {
        const points = boundaries.getPoints();
        const coordinates = [];

        for (let i = 0; i < points.length; i++) {
            coordinates.push(new JSTS.geom.Coordinate(points[i].x, points[i].y));
        }

        return coordinates;
    }

    convertFromJSTSPath(hole: any) {
        const path = new THREE.Path();
        const points = hole.getCoordinates();
        path.setFromPoints(points);

        return path;
    }

    updateFog(positions: any) {
        const visibility = [];
        const holes = positions.map((position: { lat: number; lng: number }) => {
            const p = this.tb.utils.projectToWorld([position.lng, position.lat]);
            const size = this.account.position === position ? 4 : 3;
            const hole = this.createHole(size, p);

            return this.jstsPoly(hole);
        });

        // Checks for intersections and unites the holes and then converts them back
        // to Three paths and pushes them in the visility array
        for (const i in holes) {
            for (const j in holes) {
                // Checks if first hole intersects with the second hole and skip the first
                if (holes[i].intersects(holes[j]) && i != j) {
                    holes[i] = holes[i].union(holes[j]);

                    delete holes[j];
                }
            }
            visibility.push(this.convertFromJSTSPath(holes[i]));
        }

        this.planeShape.holes = visibility;

        const geometry = new THREE.ShapeGeometry(this.planeShape);
        const material = new THREE.MeshLambertMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide,
        });

        this.fog = new THREE.Mesh(geometry, material);
        this.fog.name = 'fog';

        this.tb.world.remove(this.tb.world.getObjectByName('fog'));
        this.tb.add(this.fog);
        this.tb.repaint();
    }

    createPlane(ne: any, sw: any, padding: any) {
        const planeShape = new THREE.Shape();

        planeShape.moveTo(sw.x + padding, sw.y + padding);
        planeShape.lineTo(ne.x - padding, sw.y + padding);
        planeShape.lineTo(ne.x - padding, ne.y - padding);
        planeShape.lineTo(sw.x + padding, ne.y - padding);
        planeShape.lineTo(sw.x + padding, sw.y + padding);

        return planeShape;
    }

    createHole(size: any, xy: any) {
        const circlePath = new THREE.Path();

        circlePath.moveTo(xy.x, xy.y);
        circlePath.absarc(xy.x, xy.y, size, 0, 2 * Math.PI, false);

        return circlePath;
    }
}
