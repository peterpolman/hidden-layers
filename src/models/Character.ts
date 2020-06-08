export class Character {
    id: string;
    name: string;
    race: string;
    hitPoints: number;
    level: number;
    selected = false;
    mesh: any;
    component: string;
    position: { lat: number; lng: number };
    heading: number;

    constructor(id: string, data: any) {
        this.id = id;
        this.name = data.name;
        this.race = data.race;
        this.level = data.level;
        this.hitPoints = data.hitPoints;
        this.component = data.race;
        this.position = data.position;
        this.heading = data.heading;
    }

    get hp() {
        return this.hitPoints;
    }

    get lvl() {
        return this.level;
    }
}
