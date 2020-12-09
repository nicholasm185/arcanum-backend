var shortID = require('shortid');

module.exports = class Player{
    constructor(){
        this.playerName = '';
        this.playerID = shortID.generate();
        this.health = 5;
        this.earth = 0;
        this.fire = 0;
        this.water = 0;
        this.hand = [];
        this.deck_spell = [];
        this.deck_elememnt = [];
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


}