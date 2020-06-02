export class Character {
    id: string;
    name: string;
    race: string;
    hitPoints: number;
    level: number;
    selected = false;
    mesh: any;
    _position: { lat: number; lng: number };

    constructor(id: string, data: any) {
        this.id = id;
        this.name = data.name;
        this.race = data.race;
        this.level = data.level;
        this.hitPoints = data.hitPoints;
        this._position = data.position;
    }

    get position() {
        return this._position;
    }

    set position(position: any) {
        this._position = position;
    }

    get hp() {
        return this.hitPoints;
    }

    get lvl() {
        return this.level;
    }
}
