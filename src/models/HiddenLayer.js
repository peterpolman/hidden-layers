export default class HiddenLayer {
    constructor(id) {
        const google = window.google;

        this.id = id;
        this.markers = {};
        this.type = 'custom';
        this.renderingMode = '3d';
        this.active = false;
        this.tb = null;
        this.placesService = new google.maps.places.PlacesService(document.createElement('div'));
    }

    onAdd(map, mbxContext) {
        const Threebox = window.Threebox;
        const MAP = window.MAP;

        this.tb = new Threebox(
            MAP,
            mbxContext,
            {defaultLights: true}
        );

        // var fogColor = new THREE.Color(0xffffff);
        // this.tb.scene.background = fogColor;
        // this.tb.scene.fog = new THREE.FogExp2( 0xffffff, 0.001 );

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

    handleObjectClick(nearestObject) {
        const HL = window.HL;
        const target = nearestObject.parent.parent;
        const id = target.userData.id;

        HL.markers[id].onClick();

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
