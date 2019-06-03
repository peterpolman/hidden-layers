import firebase from 'firebase/app';

export default class HiddenLayer {
    constructor(id) {
        const google = window.google;
        const MAP = window.MAP;

        this.id = id;
        this.markers = {};
        this.type = 'custom';
        this.renderingMode = '3d';
        this.active = false;
        this.tb = null;
        this.placesService = new google.maps.places.PlacesService(document.createElement('div'));
        this.fog = null;

        // Update the fog of war when viewport changes
        MAP.on('move', () => {
            this.discover(this.markers[firebase.auth().currentUser.uid].position);
        });
    }

    onAdd(map, mbxContext) {
        const Threebox = window.Threebox;
        const THREE = window.THREE;
        const MAP = window.MAP;
        const directionalLight = new THREE.DirectionalLight(0x808080);

        this.tb = new Threebox(
            MAP,
            mbxContext,
            {defaultLights: true}
        );

        this.tb.add(directionalLight);

        MAP.on('click', (e) => {
            // calculate objects intersecting the picking ray
            var intersect = this.tb.queryRenderedFeatures(e.point)[0]
            var intersectionExists = typeof intersect == "object"

            // if intersect exists, highlight it
            if (intersect) {
                var nearestObject = intersect.object;
                this.handleObjectClick(nearestObject);
            }
            else {
                this.handleMapClick(e);
            }

            // on state change, fire a repaint
            if (this.active !== intersectionExists) {
                this.active = intersectionExists;
                this.tb.repaint();
            }
        });
    }

    discover(p) {
        const THREE = window.THREE;
        const MAP = window.MAP;
        const b = MAP.getBounds();
        const xy = this.tb.utils.projectToWorld([p.lng, p.lat]);
        const ne = this.tb.utils.projectToWorld([b._ne.lng, b._ne.lat]);
        const sw = this.tb.utils.projectToWorld([b._sw.lng, b._sw.lat]);
        const objectInScene = this.tb.world.getObjectByName('fogOfWar');
        this.tb.world.remove(objectInScene);

        let planeShape = this.createPlane(ne, sw, 5);
        let circleShape = this.createHole(2, xy);

        planeShape.holes.push(circleShape);

        let geometry = new THREE.ShapeGeometry(planeShape);
        let material = new THREE.MeshLambertMaterial({color: 0x000000, transparent: true, opacity: 0.5, side: THREE.DoubleSide});

        this.fog = new THREE.Mesh(geometry, material);
        this.fog.name = 'fogOfWar';

        this.tb.add(this.fog);
        this.tb.repaint();
    }

    createPlane(ne, sw, padding) {
        const THREE = window.THREE;
        let planeShape = new THREE.Shape();

        planeShape.moveTo( sw.x + padding, sw.y + padding);
        planeShape.lineTo( ne.x - padding, sw.y + padding);
        planeShape.lineTo( ne.x - padding, ne.y - padding);
        planeShape.lineTo( sw.x + padding, ne.y - padding);
        planeShape.lineTo( sw.x + padding, sw.y + padding);

        return planeShape;
    }

    createHole(size, xy) {
        const THREE = window.THREE;
        let circleShape = new THREE.Path();
        circleShape.moveTo((xy.x), (xy.y));
        circleShape.absarc((xy.x), (xy.y), size, 0, 2 * Math.PI, false );

        return circleShape;
    }

    handleObjectClick(nearestObject) {
        const HL = window.HL;
        const target = nearestObject.parent.parent;
        const id = target.userData.id;

        if (typeof HL.markers[id] != 'undefined') HL.markers[id].onClick();
        console.log('Casted ray hit: ', this.markers[id]);
    }

    handleMapClick(e) {
        const THREE = window.THREE;

        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshPhongMaterial( {color: 0xFF0000} );
        var cube = new THREE.Mesh( geometry, material );

        const mesh = this.tb.Object3D({obj:cube, units:'meters', scale: 1 }).setCoords([e.lngLat.lng, e.lngLat.lat]);

        this.tb.add( mesh );
        this.tb.repaint();
    }

    render(){
        this.tb.update();
    }
}
