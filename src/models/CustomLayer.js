export default class CustomLayer {
    constructor(id) {
        this.id = id;
        this.type = 'custom';
        this.renderingMode = '3d';
    }

    onAdd(map, mbxContext) {
        const Threebox = window.Threebox;

        this.tb = new Threebox(
            map,
            mbxContext,
            {defaultLights: true, passiveRendering: false}
        );

        //add mousing interactions
        MAP.on('click', (e) => {
            // calculate objects intersecting the picking ray
            var intersect = this.tb.queryRenderedFeatures(e.point)[0]
            var intersectionExists = typeof intersect == "object"

            // if intersect exists, highlight it
            if (intersect) {
                var nearestObject = intersect.object;
                alert(nearestObject.uuid)
            }

            // on state change, fire a repaint
            if (this.active !== intersectionExists) {
                this.active = intersectionExists;
                this.tb.repaint();
            }
        });
    }

    render(){
        this.tb.update();
    }
}
