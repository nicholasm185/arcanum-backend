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

    applyCard(card){
        this.doDamage(card.damage);
        this.burn += card.burn;
        this.slow += card.slow;
    }

    playCard(card){
        console.log(this.fire >= card.fire_req);
        console.log(this.earth >= card.earth_req);
        console.log(this.water >= card.water_req);
        if((this.fire >= card.fire_req) && (this.earth >= card.earth_req) && (this.water >= card.water_req)){
                this.fire -= card.fire_req;
                this.earth -= card.earth_req;
                this.water -= card.water_req;
                this.doRegen(card.regen);
                this.armor += card.armor;
                this.lifesteal += card.lifesteal;
                return true;
        }else{
            console.log("requirements not met");
            return false;
        }
    }

    doDamage(damage) {
        damage = ((this.slow > 0) ? (damage *= 1.5): damage)
        if(damage <= this.armor){
            this.armor -= damage;
        }else if(damage > this.armor){
            damage -= this.armor;
            this.armor = 0;
            this.health -= damage;
        }
    }

    doRegen(regen){
        if(this.health + regen >= 30){
            this.health = 30;
        }else{
            this.health += regen;
        }
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

    turnEnd(){
        if(this.burn > 0){
            this.health--;
        }
        this.slow = ((this.slow > 0) ? (this.slow - 1): this.slow);
        this.burn = ((this.burn > 0) ? (this.burn - 1): this.burn);
        this.lifesteal = ((this.lifesteal > 0) ? (this.lifesteal - 1): this.lifesteal);
    }
    

}