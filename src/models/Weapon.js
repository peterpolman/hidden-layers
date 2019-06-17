import Item from './Item';

export default class Weapon {
    constructor(id, data) {
        super (id, data);

        this.cooldown = data.cooldown;
        this.damage = data.damage;
    }
}
