import firebase from 'firebase/app';

export default class HiddenLayer {
    constructor() {
        this.uid = firebase.auth().currentUser.uid;

        this.id = '3d-objects';
        this.type = 'custom';
        this.renderingMode = '3d';

        this.markers = {};
        this.active = false;
        this.tb = null;

        // this.placesService = new google.maps.places.PlacesService(document.createElement('div'));
        this.walking = false;
        this.line = null;
        this.fog = null;
        this.visibility = [];
    }

    onAdd(map, mbxContext) {
        const Threebox = window.Threebox;
        const THREE = window.THREE;
        const MAP = window.MAP;
        const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
        const ambientLightLight = new THREE.AmbientLight(0xFFFFFF, 0.75);

        this.tb = new Threebox(
            MAP,
            mbxContext,
            {defaultLights: false}
        );

        this.tb.add(directionalLight);
        this.tb.add(ambientLightLight);

        // Create a plane that covers the world.
        const ne = this.tb.utils.projectToWorld([180, 85]);
        const sw = this.tb.utils.projectToWorld([-180, -85]);

        this.planeShape = this.createPlane(ne, sw, 5);

        MAP.on('click', (e) => {
            this.onClick(e);
        });
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

    discover(uid) {
        const THREE = window.THREE;
        const u = this.markers[uid];
        const s = this.markers[u.scout];
        const positions = [
            this.tb.utils.projectToWorld([u.position.lng, u.position.lat]),
            this.tb.utils.projectToWorld([s.position.lng, s.position.lat])
        ]

        for (var i = 0; i < positions.length; i++) {
            this.planeShape.holes[i] = this.createHole(2, positions[i]);
        }

        let geometry = new THREE.ShapeGeometry(this.planeShape);
        let material = new THREE.MeshLambertMaterial({color: 0x000000, transparent: true, opacity: 0.5, side: THREE.DoubleSide});

        this.fog = new THREE.Mesh(geometry, material);
        this.fog.name = 'fogOfWar';

        this.tb.world.remove(this.tb.world.getObjectByName('fogOfWar'));
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

    handleObjectClick(e, object) {
        // Select parent of parent which contains the userData
        const target = object.parent.parent;
        const id = target.userData.id;

        if (typeof this.markers[id] != 'undefined') {
            this.markers[id].onClick();
        }
        else {
            const sid = this.markers[this.uid].scout;
            this.markers[sid].setDestination(e);
        }

        console.log('Casted ray hit: ', object);
    }

    handleMapClick(e) {
        const sid = this.markers[this.uid].scout;
        this.markers[sid].setDestination(e);
        
        console.log('Map click at', e);
    }

    render(){
        this.tb.update();
    }
}
