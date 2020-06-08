import { Character } from '@/models/Character';

export class User extends Character {
    class: string;
    scout: string;
    experiencePoints: number;
    hashes: { [hash: string]: string };

    constructor(uid: string, data: any) {
        super(uid, data);
        this.class = data.class;
        this.experiencePoints = data.experiencePoints;
        this.hashes = data.hashes;
        this.scout = data.scout;
    }

    get xp() {
        return this.experiencePoints;
    }
}
