const Rarity = [
    {
        name: 'Poor',
        color: '#666666',
    },
    {
        name: 'Common',
        color: '#FFFFFF',
    },
    {
        name: 'Uncommon',
        color: '#28a745',
    },
    {
        name: 'Rare',
        color: '#007bff',
    },
    {
        name: 'Epic',
        color: '#8900ff',
    },
    {
        name: 'Legendary',
        color: '#d48700',
    },
];

export class Item {
    id: string;
    name: string;
    slug: string;
    description: string;
    amount: number;
    rarity: { name: string; color: string };
    value: number;
    slot: string;

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.slug = data.slug;
        this.description = data.description;
        this.amount = data.amount;
        this.rarity = Rarity[data.rarity];
        this.value = data.value;
        this.slot = data.slot;
    }
}
