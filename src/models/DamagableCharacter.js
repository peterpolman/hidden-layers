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
        this.hitPoints = hitPoints;
    }

    hit(damage) {
        // Check if goblin should die
        if ((this.hitPoints - damage) > 0) {
            this.ref.update({ hitPoints: this.hitPoints - damage });
            this.setInfo(damage, true);
        }
        else {
            this.ref.update({ hitPoints: 0 });
            this.setInfo(damage, true);
            this.die();
        }
    }

    heal(heal) {
        const hitPointsMax = 100;
        const fullyHealed = (this.hitPoints + heal > hitPointsMax);
        const hitPoints = (!fullyHealed) ? this.hitPoints + heal : hitPointsMax;

        this.ref.update({ hitPoints: hitPoints });
        this.setInfo(heal, false);
    }

    use(item) {
        let damage, heal;

        if (item !== null) {
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
                    console.log(`${heal} hitpoints healed. ${this.hitPoints} left.`);
                    break;
                default:
                    console.log(`You can not hit with ${item.name}...`)
                    break
            }
        }
    }

    // Remove from database and scene
    die () {
        const HL = window.HL;
        const id = this.id;

        HL.selectedTarget = null;
        HL.markerService.removeMarker(id)
        this.ref.remove();
    }
}
