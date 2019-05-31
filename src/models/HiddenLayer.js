export default class HiddenLayer {
    constructor(id) {
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
        const target = nearestObject.parent.parent;
        const id = target.userData.id;

        console.log('Casted ray hit: ', this.markers[id]);
    }

    handleMapClick(e) {
        // console.log(MAP.getBounds())



        // var ne = MAP.getBounds()._ne
        // var se = { lat: MAP.getBounds()._ne.lat, lng: MAP.getBounds()._sw.lng }
        // var sw = MAP.getBounds()._sw
        // var nw = { lat: MAP.getBounds()._sw.lat, lng: MAP.getBounds()._ne.lng }
        //
        // var getPos = (pos) => {
        //   return this.tb.utils.projectToWorld([pos.lng,pos.lat])
        // }
        //
        // var planeMaterial = new THREE.MeshLambertMaterial({color: 0xC0C0C0});
        // var planeShape = new THREE.Shape([
        //     // new THREE.Vector3(-150,-150,0),
        //     // new THREE.Vector3(150,-150,0),
        //     // new THREE.Vector3(150,150,0),
        //     // new THREE.Vector3(-150,150,0)
        //     new THREE.Vector3(getPos(sw).x/1000,getPos(sw).y/1000,0),
        //     new THREE.Vector3(getPos(se).x/1000,getPos(se).y/1000,0),
        //     new THREE.Vector3(getPos(ne).x/1000,getPos(ne).y/1000,0),
        //     new THREE.Vector3(getPos(nw).x/1000,getPos(nw).y/1000,0)
        // ]);
        // debugger
        // var plane = new THREE.Mesh( new THREE.ShapeGeometry(planeShape), planeMaterial);
        //
        // console.log(planeShape);
        //
        // const mesh = this.tb.Object3D({obj:plane, units:'meters', scale: 1 }).setCoords([e.lngLat.lng, e.lngLat.lat]);
        // this.tb.add(mesh);
        //
        // var holes = [
        //     new THREE.Vector3(-75,-75,0),
        //     new THREE.Vector3(75,-75,0),
        //     new THREE.Vector3(75,75,0),
        //     new THREE.Vector3(-75,75,0)
        // ],
        //
        // hole = new THREE.Path();
        // hole.fromPoints(holes);
        //
        // var shape = new THREE.Shape(plane.geometry.vertices);
        // shape.holes = [hole];
        // var points = shape.extractPoints();
        //
        // plane.geometry.faces = [];
        //
        // var triangles = THREE.ShapeUtils.triangulateShape ( points.shape, points.holes );
        //
        // plane.geometry.vertices.push(
        //     new THREE.Vector3(-75,-75,0),
        //     new THREE.Vector3(75,-75,0),
        //     new THREE.Vector3(75,75,0),
        //     new THREE.Vector3(-75,75,0)
        // );
        // for( var i = 0; i < triangles.length; i++ ){
        //     plane.geometry.faces.push( new THREE.Face3( triangles[i][0], triangles[i][1], triangles[i][2] ));
        // }


        // const mesh = this.tb.Object3D({obj:shape, units:'meters', scale: 1 }).setCoords([e.lngLat.lng, e.lngLat.lat]);
        //
        // this.tb.add( mesh );
        this.tb.repaint();

        //
        // // Search places
        // var request = {
        //     location: e.lngLat,
        //     radius: 1500,
        //     type: 'restaurant'
        // };
        //
        // this.placesService.nearbySearch(request, (results, status) => {
        //     if (status === google.maps.places.PlacesServiceStatus.OK) {
        //         for (var i = 0; i < results.length; i++) {
        //             const cube = new THREE.Mesh( new THREE.CubeGeometry( 10, 10, 10 ), new THREE.MeshNormalMaterial() );
        //             const mesh = this.tb.Object3D({obj:cube, units:'meters', scale: 0.05 }).setCoords([results[i].geometry.location.lng(), results[i].geometry.location.lat()]);
        //             this.tb.add(mesh);
        //         }
        //     }
        // });
    }

    render(){
        this.tb.update();
    }
}
