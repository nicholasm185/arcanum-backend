var shortID = require('shortid');

const MAX_HAND = 10
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
        var lifeStolen = this.doDamage(card.damage);
        this.burn += card.burn;
        this.slow += card.slow;
        return lifeStolen;
    }

    playCard(card){
        if((this.fire >= card.fire_req) && (this.earth >= card.earth_req) && (this.water >= card.water_req)){
                this.fire -= card.fire_req;
                this.earth -= card.earth_req;
                this.water -= card.water_req;
                this.doRegen(card.regen);
                this.armor += card.armor;
                this.lifesteal += card.lifesteal;
                return true;
        }else{
            console.log("requirements to play not met");
            return false;
        }
    }

    doDamage(damage) {
        var damageDone = 0;
        damage = ((this.slow > 0) ? (damage *= 1.5): damage)
        if(damage <= this.armor){
            this.armor -= damage;
        }else if(damage > this.armor){
            damage -= this.armor;
            this.armor = 0;
            this.health -= damage;
            damageDone = damage;
        }
        return damageDone;
    }

    doRegen(regen){
        if(this.health + regen >= 30){
            this.health = 30;
        }else{
            this.health += regen;
        }
    }

    doLifesteal(lifeStolen){
        if(this.lifesteal > 0){
            this.doRegen(lifeStolen);
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

    drawSpell(n = 1){
        for(var i = 0; i < n; i++){
            if(this.hand.length < MAX_HAND){
                var spell = this.deck_spell.pop()
                this.hand.push(spell);
                return spell;
            }
            else{
                var spell = null;
                this.deck_spell.pop();
                return spell;
            }
        };
    }

    drawElement(n = 1){
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
    
    turnStart(){
        var spellNo = this.drawSpell()
        return spellNo
    }

}