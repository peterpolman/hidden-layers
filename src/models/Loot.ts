import { Item } from '@/models/Item';

export class Loot {
    id: string;
    position: { lat: number; lng: number };
    item: Item;
    component = 'loot';
    selected = false;

    constructor(id: string, position: { lat: number; lng: number }, item: Item) {
        this.id = id;
        this.position = position;
        this.item = item;
    }
}
