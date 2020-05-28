export class User {
    uid: string;
    name: string;
    position: { lat: number; lng: number };
    class: string;
    race: string;
    hp: number;
    xp: number;
    lvl: number;
    hashes: { [hash: string]: string };

    constructor(uid: string, data: any) {
        this.uid = uid;
        this.name = data.name;
        this.position = data.position;
        this.class = data.class;
        this.race = data.race;
        this.lvl = data.level;
        this.hp = data.hitPoints;
        this.xp = data.experiencePoints;
        this.hashes = data.hashes;
    }
}
