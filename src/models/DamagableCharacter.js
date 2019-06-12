import BaseCharacter from './BaseCharacter';

export default class DamagableCharacter extends BaseCharacter {
    constructor (id, data) {
        super(id, data);

        this.hitPoints = (data.hitPoints < 0) ? 0 : data.hitPoints;
    }

    getHitPointsMarkup() {
        const color = (this.hitPoints > 50 ) ? '#8CC63E' : (this.hitPoints > 25) ? '#FFBB33' : '#ED1C24';
        return (this.hitPoints > 0)
            ? `
            <div class="bar-wrapper character-hp">
                <div class="bar" style="background-color: ${color}; width: ${this.hitPoints}%;"></div>
            </div>`
            : '';
    }

    setHitPoints(hitPoints) {
        if (this.hitPoints < hitPoints) {
            console.log('You got healed!');
        }
        else {
            console.log('You got damaged!');
        }
        this.hitPoints = hitPoints;
        this.setInfo();
    }

    hit(damage) {
        const died = (this.hitPoints - damage <= 0);
        const id = this.id;

        if (!died) {
            this.ref.update({ hitPoints: this.hitPoints - damage });
        }
        else {
            this.die(id);
        }
    }

    heal(heal) {
        const hitPointsMax = 100;
        const healed = (this.hitPoints + heal > hitPointsMax);
        const hitPoints = (!healed) ? this.hitPoints + heal : hitPointsMax;

        if (!healed) {
            this.ref.update({ hitPoints: hitPoints });
        }

    }

    use(item) {
        if (item !== null) {
            let damage, heal;

            switch(item.slug) {
                case 'sword':
                    damage = Math.floor(Math.random() * 10);
                    this.hit(damage)

                    console.log(`${damage} damage. ${this.hitPoints} left. AUTSCH!!`);
                    break;
                case 'potion':
                    heal = 20;
                    this.heal(heal)

                    // TODO Deduct a potion

                    console.log(`${damage} damage. ${this.hitPoints} left. AUTSCH!!`);
                    break;
                default:
                    console.log(`You can not hit with ${item.name}...`)
                    break
            }
        }
    }

    // Remove from database and scene
    die (id) {
        const HL = window.HL;
        HL.markerService.removeMarker(id)
    }
}
