// third party imports
var io = require('socket.io')(process.env.PORT || 8080);

// local imports
var Player = require('./Classes/player');
var dbHelper = require('./mongoHelper');
var dbFunc = require('./dbFunctions');
const game = require('./Models/game');
const card = require('./Models/card');

var players = [];
var sockets = [];

var cards;
var cardIDs;
dbFunc.getCards().then(function(results){
    cards = results;
    cardIDs = cards.map(function(card){
        return card["cardNo"];
    });
    console.log("got cards")
    console.log(cardIDs);
});

// poo poo workaround for "open" socket.io event emitted twice by unity
var gameRunning = false;

// *****************************accepting connections**************************** 
console.log('server starting');
io.on('connection', function(socket) {
    if (Object.keys(players).length < 2){
        console.log('connection established');
        
        var player = new Player();
        var thisPlayerID = player.playerID;

        players[thisPlayerID] = player;
        sockets[thisPlayerID] = socket;

        socket.emit('register', {id: thisPlayerID})
        socket.broadcast.emit('hello', {msg: 'im here'})

        console.log('number of players connected: ' + Object.keys(players).length);

        socket.on('username', function(e){
            console.log('received name: '+ e.name);
            player.playerName = e.name;
            if(Object.keys(players).length == 2 && !gameRunning){
                console.log("game ready to start");
                gameRunning = true;
                mainGameLoop(players, sockets);
            };
        })

        socket.on('disconnect', function(){
            console.log('connection lost');
            delete players[thisPlayerID];
            delete sockets[thisPlayerID];
        })
        
    } 
    else{
        socket.emit('ERR_servFull', {status: "error",msg: 'server is full', curNumPlayers: Object.keys(players).length});
        console.log('connection attempted but server is full');
        socket.disconnect();
    };
    
});

// *****************************main loop of the game**************************** 
function mainGameLoop(players, sockets){
    // get randomized turn
    var turn = Math.round(Math.random()) + 1;
    var turnNum = 0;
    var round = 1;
    console.log("Game commencing; get ready!");

    // get player objects from players
    var IDs = Object.keys(sockets);
    console.log(IDs);
    p1 = players[IDs[0]];
    p2 = players[IDs[1]];

    // set the random decks
    p1['deck_spell'] = randomDeck(cardIDs);
    p1['deck_element'] = randomElement();
    p2['deck_spell'] = randomDeck(cardIDs);
    p2['deck_element'] = randomElement();

    // get each player's sockets from sockets, telling their turn number
    p1S = sockets[IDs[0]];
    p1S.emit('playerNumber', {you: 1});
    p2S = sockets[IDs[1]];
    p2S.emit('playerNumber', {you: 2});

    // Generate Hand
    if(turn == 1){
        p1.drawSpell(3);
        p2.drawSpell(3);
        p1.drawElement(2);
        p2.drawElement(2);
    }else{
        p1.drawSpell(3);
        p2.drawSpell(3);
        p1.drawElement(2)
        p2.drawElement(2);
    }

    p1.deck_spell = [1]
    p2.deck_spell = [1]

    // tell the current turn to all players
    p1S.emit('curTurn', {curTurn: turn});
    p2S.emit('curTurn', {curTurn: turn});

    // Send the first state of board
    sendBoard(p1, p2, p1S, p2S);

    dbFunc.createGame(p1, p2, true, turn, ((turn == 1) ? [1,2] : [2,1])).then(function(result){
        console.log(result);
    });

    // test function for both players
    p1S.on('yeet', function(e){
        if(turn == 1){
            console.log("player 1 yeeted " + e.yeet);
            turn = 2;
            turnNum ++;
            p2.doDamage(1);
            sendTurn(p1S, p2S, turn);
            sendBoard(p1, p2, p1S, p2S);
            if(checkWin(p1, p2, p1S, p2S)){
                p1S.disconnect();
                p2S.disconnect();
                cleanup(players, sockets);
                console.log('game finished');
                gameRunning = false;
                return;
            }

        }
        else{
            console.log('p1 tried to yeet when its not their turn');
            sendTurnWarning(p1S, "its not your turn");
        }
    });

    p2S.on('yeet', function(e){
        if(turn == 2){
            console.log("player 2 yeeted "+ e.yeet);
            turn = 1;
            turnNum ++;
            p1.doDamage(1);
            sendTurn(p1S, p2S, turn);
            sendBoard(p1, p2, p1S, p2S);
            if(checkWin(p1, p2, p1S, p2S)){
                p1S.disconnect();
                p2S.disconnect();
                cleanup(players, sockets);
                console.log('game finished');
                gameRunning = false;
                return;
            }
        }
        else{
            console.log('p2 tried to yeet when its not their turn');
            sendTurnWarning(p2S, "its not your turn");
        }
    });

    // play card event
    p1S.on('playCard', function(e){
        if(turn == 1){
            if(p1.hand.includes(parseInt(e.cardNo))){
                const card = cards.find(card => card.cardNo === parseInt(e.cardNo));
                if(p1.playCard(card)){
                    console.log('p1 playing card: ' + e.cardNo);
                    console.log(card);
                    const cardIndex = p1.hand.indexOf(card.cardNo);
                    p1.hand.splice(cardIndex, 1);
                    p1.doLifesteal(p2.applyCard(card));
                    successTurn(p1S);
                    p2S.emit('lastCard', {cardNo: e.cardNo})
                    sendBoard(p1, p2, p1S, p2S);
                    if(checkWin(p1, p2, p1S, p2S)){
                        p1S.disconnect();
                        p2S.disconnect();
                        cleanup(players, sockets);
                        console.log('game finished');
                        gameRunning = false;
                        return;
                    }
                }else{
                    sendCardWarning(p1S, "insufficient resources to play card");
                    console.log("insufficient resources to play card");
                }
            }else{
                sendCardWarning(p1S, "card not in hand");
                console.log("card not in hand");
            }
        }else{
            sendTurnWarning(p1S, 'its not your turn');
            console.log('its not your turn');
        }
        
    });

    p2S.on('playCard', function(e){
        if(turn == 2){
            if(p2.hand.includes(parseInt(e.cardNo))){
                const card = cards.find(card => card.cardNo === parseInt(e.cardNo));
                if(p2.playCard(card)){
                    console.log('p2 playing card: ' + e.cardNo);
                    console.log(card);
                    const cardIndex = p2.hand.indexOf(card.cardNo);
                    p2.hand.splice(cardIndex, 1);
                    p2.doLifesteal(p1.applyCard(card));
                    successTurn(p2S);
                    p1S.emit('lastCard', {cardNo: e.cardNo})
                    sendBoard(p1, p2, p1S, p2S);
                    if(checkWin(p1, p2, p1S, p2S)){
                        p1S.disconnect();
                        p2S.disconnect();
                        cleanup(players, sockets);
                        console.log('game finished');
                        gameRunning = false;
                        return;
                    }
                }else{
                    sendCardWarning(p2S, "insufficient resources to play card");
                    console.log("insufficient resources to play card");
                }
            }else{
                sendCardWarning(p2S, "card not in hand");
                console.log("card not in hand");
            }
        }else{
            sendTurnWarning(p2S, 'its not your turn');
            console.log('its not your turn');
        }
    });

    // end turn event
    p1S.on('endTurn', function(e){
        if(turn == 1){
            console.log('ending p1 turn');
            p1.turnEnd();
            turn = 2;
            turnNum ++;
            round = Math.ceil(turnNum/2);
            drawManager(p2, round);
            sendTurn(p1S, p2S, turn);
            sendBoard(p1, p2, p1S, p2S);
            if(checkWin(p1, p2, p1S, p2S)){
                p1S.disconnect();
                p2S.disconnect();
                cleanup(players, sockets);
                console.log('game finished');
                gameRunning = false;
                return;
            }
            console.log(p1);
            console.log(p2);
        }else{
            console.log('not your turn')
        }
    });

    p2S.on('endTurn', function(e){
        if(turn == 2){
            console.log('ending p2 turn');
            p2.turnEnd();
            turn = 1;
            turnNum ++;
            round = Math.ceil(turnNum/2);
            drawManager(p1, round);
            sendTurn(p1S, p2S, turn);
            sendBoard(p1, p2, p1S, p2S);
            if(checkWin(p1, p2, p1S, p2S)){
                p1S.disconnect();
                p2S.disconnect();
                cleanup(players, sockets);
                console.log('game finished');
                gameRunning = false;
                return;
            }
            console.log(p1);
            console.log(p2);
        }else{
            console.log('not your turn')
        }
        
    });
    
    p1S.on('disconnect', function(){
        if(!checkWin(p1, p2, p1S, p2S)){
            p2S.emit('winner', {winner: 2});
            gameRunning = false;
        }
        p2S.disconnect();
        cleanup(players, sockets);
    })

    p2S.on('disconnect', function(){
        if(!checkWin(p1, p2, p1S, p2S)){
            p1S.emit('winner', {winner: 1});
            gameRunning = false;
        }
        p1S.disconnect();
        cleanup(players, sockets);
    })
    
};

// *****************************utility functions**************************** 
function nextTurn(p1,p2, turnNum){

}

function drawManager(player, round){
    var numEl = 0;
    if(round == 1){
        numEl = 1;
    }else if(round == 2){
        numEl = 2;
    }else if(round == 3){
        numEl = 3;
    }else if(round == 4){
        numEl = 4;
    }else if(round >= 5){
        numEl = 5;
    }
    player.drawElement(numEl);
    if(checkWin(p1, p2, p1S, p2S)){
        p1S.disconnect();
        p2S.disconnect();
        cleanup(players, sockets);
        console.log('game finished');
        gameRunning = false;
        return;
    }
    player.drawSpell(1);
}

function successTurn(playerSocket){
    playerSocket.emit('successCard', {msg: 'success playing card'});
}

function sendCardWarning(playerSocket, msg){
    playerSocket.emit('ERR_cardError', {status: "error",msg: msg})
}

function sendTurnWarning(playerSocket, msg){
    playseSocket.emit('WARN_turn', {msg: msg})
}

function sendTurn(p1S, p2S, curTurn){
    p1S.emit('curTurn', {curTurn: curTurn});
    p2S.emit('curTurn', {curTurn: curTurn});
}

function sendBoard(p1, p2, p1S, p2S){
    var p1c, p1e, p2c, p2e;
    p1c = JSON.parse(JSON.stringify(p1));
    p1e = JSON.parse(JSON.stringify(p1));
    p2c = JSON.parse(JSON.stringify(p2));
    p2e = JSON.parse(JSON.stringify(p2));
    p1c['deck_spell'] = p2c['deck_spell'] = p1e['deck_spell'] = p2e['deck_spell'] = [];
    p1c['deck_element'] = p2c['deck_element'] = p1e['deck_element'] = p2e['deck_element'] = [];
    p1c['cur_deck_element'] = p2c['cur_deck_element'] = p1e['cur_deck_element'] = p2e['cur_deck_element'] = []
    p1e['hand'] = [p1['hand'].length];
    p2e['hand'] = [p2['hand'].length];
    p1S.emit('Board:State', {you: p1c, enemy: p2e});
    p2S.emit('Board:State', {you: p2c, enemy: p1e});
}

function cleanup(players, sockets){
    var IDs = Object.keys(players);
    for(var i = 0; i < players.IDs; i++){
        delete players[IDs[i]];
        delete sockets[IDs[i]];
    }
}

function checkWin(p1, p2, p1S, p2S){
    if (p1['health'] <= 0 || (p1.deck_spell.length) == 0){
        p1S.emit('winner', {winner: 2})
        p2S.emit('winner', {winner: 2})
        return 1;
    }
    if (p2['health'] <= 0 || (p1.deck_spell.length) == 0){
        p1S.emit('winner', {winner: 1})
        p2S.emit('winner', {winner: 1})
        return 1;
    }
    return 0;
}

function shuffle(array) {
    var i = array.length,
        j = 0,
        temp;
    while (i--) {
        j = Math.floor(Math.random() * (i+1));
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function randomDeck(cardIDs){
    const p1 = shuffle(cardIDs);
    const p2 = shuffle(cardIDs)
    return p1.concat(p2);
}

function randomElement(){
    const pool = [1,1,1,1,1,1,1,1,1,1,
                2,2,2,2,2,2,2,2,2,2,
                3,3,3,3,3,3,3,3,3,3]
    return shuffle(pool);
}
