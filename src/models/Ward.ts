export class Ward {
    id: string;
    position: { lat: number; lng: number };
    owner: string;
    component = 'ward';
    selected = false;
    created: number;

    constructor(id: string, data: any) {
        this.id = id;
        this.position = data.position;
        this.owner = data.owner;
        this.created = data.created;
    }
}
