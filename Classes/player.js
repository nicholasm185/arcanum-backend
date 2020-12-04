var shortID = require('shortid');

module.exports = class Player{
    constructor(){
        this.playerName = "";
        this.playerID = shortID.generate();
    }
}