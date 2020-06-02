import { Item } from '@/models/Item';

export class Slot {
    name: string;
    item: Item | null;

    constructor(data: { name: string; item: Item | null }) {
        this.name = data.name;
        this.item = data.item || null;
    }
}
