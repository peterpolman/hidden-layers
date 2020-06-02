export class Character {
    id: string;
    name: string;
    position: { lat: number; lng: number };
    race: string;
    hitPoints: number;
    level: number;
    selected = false;

    constructor(id: string, data: any) {
        this.id = id;
        this.name = data.name;
        this.position = data.position;
        this.race = data.race;
        this.level = data.level;
        this.hitPoints = data.hitPoints;
    }

    get hp() {
        return this.hitPoints;
    }

    get lvl() {
        return this.level;
    }
}
