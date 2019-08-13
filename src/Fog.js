const jsts = require('jsts');
const THREE = window.THREE;

export default class Fog {
    constructor(tb, ne, sw, x) {
        this.tb = tb;
        this.planeShape = this.createPlane(ne, sw, x);
    }

    jstsPoly(path) {
        const geometryFactory = new jsts.geom.GeometryFactory();
        const jstsPath = this.convertToJSTSPath(path);
        const linearRing = geometryFactory.createLinearRing(jstsPath);

        return geometryFactory.createPolygon(linearRing);
    }

    convertToJSTSPath(boundaries) {
        const points = boundaries.getPoints();
        let coordinates = [];

        for (var i = 0; i < points.length; i++) {
            coordinates.push(new jsts.geom.Coordinate(points[i].x, points[i].y));
        }

        return coordinates;
    }

    convertFromJSTSPath(hole) {
        let path = new THREE.Path();
        let points = hole.getCoordinates()
        path.setFromPoints(points);

        return path;
    }

    updateFog(positions) {
        const HL = window.HL;
        let holes = [],
            visibility = [];

        // Loop through the positions that need discovery
        for (let id in positions) {
            let p = this.tb.utils.projectToWorld([positions[id].lng, positions[id].lat])
            // let size = (HL.user.id === id) ? 2 : 1.5;
            let size = (HL.user.id === id) ? 4 : 3;
            let hole = this.createHole(size, p);
            let jstsHole = this.jstsPoly(hole);

            holes.push(jstsHole);
        }

        // Checks for intersections and unites the holes and then converts them back
        // to Three paths and pushes them in the visility array
        for (let i in holes) {
            for (let j in holes) {
                // Checks if first hole intersects with the second hole and skip the first
                if (holes[i].intersects(holes[j]) && (i != j)) {
                    holes[i] = holes[i].union(holes[j])

                    delete holes[j]
                }
            }
            visibility.push(this.convertFromJSTSPath(holes[i]));
        }

        this.planeShape.holes = visibility;

        let geometry = new THREE.ShapeGeometry(this.planeShape);
        let material = new THREE.MeshLambertMaterial({
            color: 0x000000,
            transparent: true,
            opacity: .5,
            side: THREE.DoubleSide
        });

        this.fog = new THREE.Mesh(geometry, material);
        this.fog.name = 'fogOfWar';

        this.tb.world.remove(this.tb.world.getObjectByName('fogOfWar'));
        this.tb.add(this.fog);
        this.tb.repaint();
    }

    createPlane(ne, sw, padding) {
        const THREE = window.THREE;
        let planeShape = new THREE.Shape();

        planeShape.moveTo(sw.x + padding, sw.y + padding);
        planeShape.lineTo(ne.x - padding, sw.y + padding);
        planeShape.lineTo(ne.x - padding, ne.y - padding);
        planeShape.lineTo(sw.x + padding, ne.y - padding);
        planeShape.lineTo(sw.x + padding, sw.y + padding);

        return planeShape;
    }

    createHole(size, xy) {
        let circlePath = new THREE.Path();

        circlePath.moveTo((xy.x), (xy.y));
        circlePath.absarc((xy.x), (xy.y), size, 0, 2 * Math.PI, false);

        return circlePath;
    }
}
