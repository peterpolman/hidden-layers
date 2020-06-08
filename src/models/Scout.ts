import { Character } from '@/models/Character';

export class Scout extends Character {
    owner: string;
    hashes: { [hash: string]: string };
    destination: { lat: number; lng: number };
    route: any;

    constructor(uid: string, data: any) {
        super(uid, data);
        this.hashes = data.hashes;
        this.owner = data.uid;
        this.destination = data.destination;
        this.route = data.route;
    }
}
