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
    component = 'item';
    active = false;
    type: string;

    constructor(data: any) {
        this.id = data.id;
        this.type = data.type;
        this.name = data.name;
        this.slug = data.slug;
        this.description = data.description;
        this.amount = data.amount;
        this.rarity = Rarity[data.rarity];
        this.value = data.value;
        this.slot = data.slot;
    }

    activate() {
        this.active = true;
    }
}

export class Weapon extends Item {
    damage: number;
    speed: number;

    constructor(data: any) {
        super(data);

        this.damage = data.damage || 10;
        this.speed = data.speed || 1000;
    }
}

export class Consumable extends Item {
    stat: string;
    increase: number;
    decrease: number;
    duration: number;

    constructor(data: any) {
        super(data);

        this.stat = data.stat;
        this.increase = data.increase || 0;
        this.decrease = data.decrease || 0;
        this.duration = data.duration || 0;
    }
}

export class Miscellaneous extends Item {
    constructor(data: any) {
        super(data);
    }
}
export class Ammo extends Item {
    constructor(data: any) {
        super(data);
    }
}
export class Armor extends Item {
    constructor(data: any) {
        super(data);
    }
}
