import { Character } from '@/models/Character';

export class User extends Character {
    class: string;
    xp: number;
    hashes: { [hash: string]: string };

    constructor(uid: string, data: any) {
        super(uid, data);
        this.class = data.class;
        this.xp = data.experiencePoints;
        this.hashes = data.hashes;
    }
}
