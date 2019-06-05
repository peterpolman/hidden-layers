import Character from './Character';

export default class User extends Character {
    constructor (id, data) {
        super(id, data);

        this.hitPoints = (data.hitPoints < 0) ? 0 : data.hitPoints;
        this.hitPointsColor = (this.hitPoints > 50 ) ? '#8CC63E' : (this.hitPoints > 25) ? '#FFBB33' : '#ED1C24';
        this.hitPointsMarkup = `
            <div class="bar-wrapper character-hp">
                <div class="bar" style="background-color: ${this.hitPointsColor}; width: ${this.hitPoints}%;"></div>
            </div>`;
    }
}
