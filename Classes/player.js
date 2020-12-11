var shortID = require('shortid');

module.exports = class Player{
    constructor(){
        this.playerName = '';
        this.playerID = shortID.generate();
        this.health = 30;
        this.earth = 0;
        this.fire = 0;
        this.water = 0;
        this.hand = [];
        this.deck_spell = [];
        this.deck_element = [];
        this.burn = 0;
        this.slow = 0;
        this.armor = 0;
        this.lifesteal = 0;
    }

    doDamage(damage) {
        this.health -= damage;
    }

    updateEarth(num){
        this.earth += num;
    }

    updateFire(num){
        this.fire += num;
    }

    updateWater(num){
        this.water += num;
    }

    drawSpell(n){
        for(var i = 0; i < n; i++){
            this.hand.push(this.deck_spell.pop());
        };
    }

    drawElement(n){
        for(var i = 0; i < n; i++){
            const drawn = this.deck_element.pop()
            switch (drawn) {
                case 1:
                    this.earth ++;
                    break;
                case 2:
                    this.fire ++;
                    break
                case 3:
                    this.water ++;
                    break
                default:
                    break;
            }
        };
    }
    

}