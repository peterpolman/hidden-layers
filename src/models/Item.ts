export default class Item {
    name: string;
    slug: string;
    amount: number;

    constructor(data: any) {
        this.name = data.name;
        this.slug = data.slug;
        this.amount = data.amount;
    }
}
