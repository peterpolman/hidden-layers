import { Character } from '@/models/Character';

export class User extends Character {
    class: string;
    experiencePoints: number;
    hashes: { [hash: string]: string };

    constructor(uid: string, data: any) {
        super(uid, data);
        this.class = data.class;
        this.experiencePoints = data.experiencePoints;
        this.hashes = data.hashes;
    }

    get xp() {
        return this.experiencePoints;
    }
}
