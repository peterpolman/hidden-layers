export default class User {
    constructor (
        id,
        color,
        position
    ) {
        const customLayer = window.customLayer;

        this.id = id;
        this.color = color;
        this.coordinates = position;

        customLayer.world.loadObj({
            obj: './models/human/human.obj',
            mtl: './models/human/human.mtl'
        }, (human) => {
            this.mesh = human.setCoords([position.lng, position.lat]);
            this.mesh.scale.set(0.05,0.05,0.05);
            customLayer.world.add(this.mesh);
        });
    }

    setPosition(position) {
        this.mesh.setCoords([position.lng, position.lat]);
        this.mesh.updateMatrix();
    }

}
