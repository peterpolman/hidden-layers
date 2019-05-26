export default class CustomLayer {
    constructor(id) {
        this.id = id;
        this.type = 'custom';
        this.renderingMode = '3d';
    }

    onAdd(map, mbxContext) {
        const Threebox = window.Threebox;

        this.world = new Threebox(
            map,
            mbxContext,
            {defaultLights: true, passiveRendering: false}
        );

        //add mousing interactions
        map.on('click', (e) => {
            // calculate objects intersecting the picking ray
            var intersect = this.world.queryRenderedFeatures(e.point)[0]
            var intersectionExists = typeof intersect == "object"

            // if intersect exists, highlight it
            if (intersect) {
                var nearestObject = intersect.object;
                alert(nearestObject.uuid)
            }

            // on state change, fire a repaint
            if (this.active !== intersectionExists) {
                this.active = intersectionExists;
                this.world.repaint();
            }
        });
    }

    render(){
        this.world.update();
    }
}
