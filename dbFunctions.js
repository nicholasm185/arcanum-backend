var Game = require('./Models/game');
var Player = require('./Models/player');
var Card = require('./Models/card');

async function createGame(p1, p2, gamestate){
    const newGame = new Game({
        p1: p1,
        p2: p2,
        gamestate: gamestate
    });
    const newGameID = await newGame.save();
    // console.log("returned: " + newGameID._id);
    // const result = await Game.findOne({_id: newGameID._id});
    // console.log(result);
    return newGameID;
};

async function updateGameTurn(gameID, curTurn){
    const result = await Game.findOne({_id:gameID});
    if(result == null){
        console.log("error, game not found")
    }
    else{
        // console.log(result);
        result.cur_turn = curTurn;
        await result.save();
        return result;
    }
}

async function getGame(gameID){
    const result = await Game.findOne({_id: gameID});
    if(result == null){
        console.log("game not found")
    }
    return result;
};

async function createPlayer(username) {
    const newPlayer = new Player({
        username: username,
        gameID: "test",
        hand: ["a","b","c"]
    });
    const newPlayerID = await newPlayer.save();
    console.log("returned: " + newPlayerID);
    // const result = await Game.findOne({_id: newPlayerID._id});
    // console.log(result);
    return newPlayerID;
}

async function getCards(){
    const result = await Card.find();
    if(result == null){
        console.log("cards not found");
    }
    // console.log(result);
    return result
}

exports.createGame = createGame;
exports.getGame = getGame;
exports.updateGameTurn = updateGameTurn;
exports.createPlayer = createPlayer;
exports.getCards = getCards;