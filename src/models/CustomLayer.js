export default class CustomLayer {
    constructor(id) {
        this.id = id;
        this.type = 'custom';
        this.renderingMode = '3d';
    }

    onAdd(map, mbxContext) {
        const Threebox = window.Threebox;
        const MAP = window.MAP;

        this.tb = new Threebox(
            MAP,
            mbxContext,
            {defaultLights: true}
        );

        //add mousing interactions
        MAP.on('click', (e) => {
            // calculate objects intersecting the picking ray
            var intersect = this.tb.queryRenderedFeatures(e.point)[0]
            var intersectionExists = typeof intersect == "object"

            // if intersect exists, highlight it
            if (intersect) {
                var nearestObject = intersect.object;
                var target = nearestObject.parent.parent;
                alert(target.name);
                console.log(target.userData);
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
