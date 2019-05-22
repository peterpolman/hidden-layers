import * as THREE from 'three';
import CameraSync from '../camera/CameraSync.js';
import Utils from '../utils/Utils.js';

export default class CustomLayer {
    constructor(id) {
        this.id = id;
        this.type = 'custom';
        this.renderingMode = '3d';
        this.map = map;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(0, window.innerWidth / window.innerHeight, 0.000000000001, Infinity);
        this.world = new THREE.Group();

        const sunlight = new THREE.DirectionalLight(0xffffff, 0.80);
        sunlight.position.set(0,80000000, 100000000);
        sunlight.matrixWorldNeedsUpdate = true;

        this.world.add(sunlight);
        this.scene.add(this.world);
        this.cameraSync = new CameraSync(this.map, this.camera, this.world);

        this.raycaster = new THREE.Raycaster();
    }

    onAdd(map, gl) {
        // Set up a THREE.js scene
        this.renderer = new THREE.WebGLRenderer( {
            alpha: true,
            antialias: true,
            canvas: map.getCanvas(),
            context: gl
        });

        this.renderer.shadowMap.enabled = true;
        this.renderer.autoClear = false;
        //
        // //add mousing interactions
        // map.on('click', function(e){
        //     const pos = new Utils().projectToWorld(e.lngLat);
        //
        //     var mouse = new THREE.Vector2();
        //
        //     // // scale mouse pixel position to a percentage of the screen's width and height
        //     mouse.x = ( point.x / this.map.transform.width ) * 2 - 1;
        //     mouse.y = 1 - ( point.y / this.map.transform.height ) * 2;
        //
        //     this.raycaster.setFromCamera(mouse, this.camera);
        //
        //     // calculate objects intersecting the picking ray
        //     var intersects = this.raycaster.intersectObjects(this.world.children, true);
        //
        //     debugger
        // }.bind(this));
    }

    render(gl, matrix) {
        if (this.map.repaint) this.map.repaint = false;
        this.renderer.state.reset();
        this.renderer.render( this.scene, this.camera );
        this.map.triggerRepaint();
    }
}
