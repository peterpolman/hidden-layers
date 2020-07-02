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
    image: string;
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
        this.image = data.image;
        this.type = data.type;
        this.name = data.name;
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
    armor: number;

    constructor(data: any) {
        super(data);

        this.damage = data.damage;
        this.armor = data.armor;
        this.speed = data.speed;
    }
}

export class Consumable extends Item {
    stat: string;
    increase: number;
    decrease: number;
    duration: number;
    speed: number;

    constructor(data: any) {
        super(data);

        this.stat = data.stat;
        this.increase = data.increase || 0;
        this.decrease = data.decrease || 0;
        this.duration = data.duration || 0;
        this.speed = data.speed || 0;
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
export class Money extends Item {
    constructor(data: any) {
        super(data);
    }
}
export class Armor extends Item {
    constructor(data: any) {
        super(data);
    }
}
