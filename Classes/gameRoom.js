module.exports = class GameRoom{
    constructor(p1, p2, p1S, p2S, gameID){
        this.turn;
        this.turnNum;
        this.round;
        this.gameID;
        this.p1 = p1;
        this.p2 = p2;
        this.p1S = p1S;
        this.p2S = p2S;
    }
}