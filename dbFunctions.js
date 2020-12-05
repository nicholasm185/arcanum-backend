var Game = require('./Models/game')

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

exports.createGame = createGame;
exports.getGame = getGame;
exports.updateGameTurn = updateGameTurn;