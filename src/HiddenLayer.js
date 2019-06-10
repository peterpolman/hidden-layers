const Geohash = require('latlon-geohash');
const jsts = require('jsts');
const THREE = window.THREE;

import firebase from 'firebase/app';
import MarkerService from './services/MarkerService';
import SpawnService from './services/SpawnService';
import GeoService from './services/GeoService';

export default class HiddenLayer {
    constructor() {
        this.uid = firebase.auth().currentUser.uid;

        this.markerService = new MarkerService();
        this.geoService = new GeoService();

        this.id = '3d-objects';
        this.type = 'custom';
        this.renderingMode = '3d';

        this.user = null;
        this.scout = null;
        this.wards = [];

        this.markers = [];
        this.active = false;
        this.tb = null;
        this.fog = null;
        this.selected = null;
    }

    onAdd(map, mbxContext) {
        const Threebox = window.Threebox;
        const MAP = window.MAP;
        const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.65);
        const ambientLightLight = new THREE.AmbientLight(0xFFFFFF, 1);

        this.tb = new Threebox(
            MAP,
            mbxContext,
            {defaultLights: false}
        );

        this.tb.add(directionalLight);
        this.tb.add(ambientLightLight);

        const ne = this.tb.utils.projectToWorld([180, 85]);
        const sw = this.tb.utils.projectToWorld([-180, -85]);

        // Create a plane that covers the world.
        this.planeShape = this.createPlane(ne, sw, 5);

        MAP.on('click', (e) => this.onClick(e));
    }

    onClick(e) {
        // calculate objects intersecting the picking ray
        var intersect = this.tb.queryRenderedFeatures(e.point)[0]
        var intersectionExists = typeof intersect == "object"

        // if intersect exists, highlight it
        if (intersect) {
            var object = intersect.object;
            this.handleObjectClick(e, object);
        }
        else {
            this.handleMapClick(e);
        }

        // on state change, fire a repaint
        if (this.active !== intersectionExists) {
            this.active = intersectionExists;
            this.tb.repaint();
        }
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

    updateFog() {
        const positionsAreEqual = (p1, p2) => {
            return (p1.lat === p2.lat) && (p1.lng === p2.lng);
        }
        const hashesAreEqual = (h1, h2) => {
            return (h1 === h2);
        }
        let positions = [],
            holes = [],
            visibility = [];

        // Set the positions for user and scout
        positions[this.user.id] = this.user.position;
        positions[this.scout.id] = this.scout.position;

        // Loop through the positions that need discovery
        for (let id in positions) {
            let p = this.tb.utils.projectToWorld([positions[id].lng, positions[id].lat])
            let hole = this.createHole(1, p);
            let jstsHole = this.jstsPoly(hole);

            // Check if the positions changed compared to the previous positions
            if (!positionsAreEqual(this.markerService.positions[id], positions[id]) || !this.markerService.markersLoaded[id]) {
                const hash = Geohash.encode(positions[id].lat, positions[id].lng, 7);

                // Do soft discovery change visiblity
                // TODO Update the visibilty of the available objects based on the discovery radius

                // Checks if hash is changed, do a hard discovery
                if (!hashesAreEqual(this.markerService.hashes[id], hash) || !this.markerService.markersLoaded[id]) {
                    // Load markers for the new positions and story them
                    this.markerService.loadNearbyMarkers(id, positions[id], this.markerService.hashes[id]);

                    console.log('Hash change detected! Discover new markers for ', id, positions[id])
                }
            }

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
            opacity: 0.5,
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

    handleObjectClick(e, object) {
        // Select parent of parent which contains the userData
        const target = object.parent.parent;
        const id = target.userData.id;

        // Mind that the fog of war can also be clicked but is not in the marker list
        // Handle that click as a destination that is set
        if (typeof this.markers[id] != 'undefined') {
            this.markers[id].onClick();
        }
        else if (this.scout.id === id) {
            this.scout.onClick();
        }
        else {
            if (this.selected) {
                this.selected.onMapClickWhenSelected(e);
            }
        }

        console.log('Casted ray hit: ', object);
    }

    handleMapClick(e) {
        if (this.selected) {
            this.selected.onMapClickWhenSelected(e);
        }
        console.log('Map click at', e);
    }

    render(){
        this.tb.update();
    }
}
