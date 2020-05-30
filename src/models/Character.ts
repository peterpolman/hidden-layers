export class Character {
    id: string;
    name: string;
    position: { lat: number; lng: number };
    race: string;
    hp: number;
    lvl: number;
    target = false;

    constructor(id: string, data: any) {
        this.id = id;
        this.name = data.name;
        this.position = data.position;
        this.race = data.race;
        this.lvl = data.level;
        this.hp = data.hitPoints;
    }
}
