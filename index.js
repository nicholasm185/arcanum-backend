// third party imports
var shortID = require('shortid');
var io = require('socket.io')(process.env.PORT || 8080);

// local imports
var Player = require('./Classes/player');
var GameRoom = require ('./Classes/gameRoom');
var dbHelper = require('./mongoHelper');
var dbFunc = require('./dbFunctions');
const game = require('./Models/game');
const card = require('./Models/card');

var players = [];
var sockets = [];
var games = [];

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

// *****************************accepting connections**************************** 
function mainLoop(){
    var pqueue = 0;
    var lastJoined;
    console.log('server starting');
    io.on('connection', function(socket) {
        // if (Object.keys(players).length < 2){
            console.log('connection established');
            
            var player = new Player();
            var thisPlayerID = player.playerID;

            players[thisPlayerID] = player;
            sockets[thisPlayerID] = socket;

            socket.emit('register', {id: thisPlayerID})
            socket.broadcast.emit('hello', {msg: 'im here'})

            console.log('number of players connected: ' + Object.keys(players).length);
            pqueue += 1;

            socket.on('username', function(e){
                console.log('received name: '+ e.name);
                player.playerName = e.name;
                if(pqueue == 2){
                    console.log('last joined: ', lastJoined);
                    console.log('just joined: ', thisPlayerID);
                    console.log("game ready to start");
                    var gameID = shortID.generate()
                    var newgame = new GameRoom(players[lastJoined],players[thisPlayerID],sockets[lastJoined],sockets[thisPlayerID], gameID);
                    games[gameID] = newgame;
                    console.log(games[gameID]);
                    mainGameLoop(games[gameID], games);
                    // delete players[thisPlayerID];
                    // delete sockets[thisPlayerID];
                    // delete players[lastJoined];
                    // delete sockets[lastJoined];
                    pqueue = 0;
                }else{
                    lastJoined = thisPlayerID;
                    console.log('last joined: ', lastJoined);
                }
            })

            socket.on('disconnect', function(){
                console.log('connection lost');
                delete players[thisPlayerID];
                delete sockets[thisPlayerID];
            })
            
        // } 
        // else{
        //     socket.emit('ERR_servFull', {status: "error",msg: 'server is full', curNumPlayers: Object.keys(players).length});
        //     console.log('connection attempted but server is full');
        //     socket.disconnect();
        // };
        
    });
}

// *****************************main loop of the game**************************** 
function mainGameLoop(game, games){
    // get randomized game.turn
    game.turn = Math.round(Math.random()) + 1;
    game.turnNum = 0;
    game.round = 1;
    console.log("Game commencing; get ready!");

    // set the random decks
    game.p1['deck_spell'] = randomDeck(cardIDs);
    game.p1['deck_element'] = randomElement();
    game.p2['deck_spell'] = randomDeck(cardIDs);
    game.p2['deck_element'] = randomElement();

    // get each player's sockets from sockets, telling their game.game.turn number
    game.p1S.emit('playerNumber', {you: 1});
    game.p2S.emit('playerNumber', {you: 2});

    // Generate Hand
    if(game.turn == 1){
        game.p1.drawSpell(4);
        game.p2.drawSpell(3);
        game.p1.drawElement(1);
        game.p2.drawElement(1);
    }else{
        game.p1.drawSpell(3);
        game.p2.drawSpell(4);
        game.p1.drawElement(1)
        game.p2.drawElement(1);
    }

    // tell the current game.turn to all players
    game.p1S.emit('curTurn', {curTurn: game.turn});
    game.p2S.emit('curTurn', {curTurn: game.turn});

    // Send the first state of board
    sendBoard(game.p1, game.p2, game.p1S, game.p2S);

    dbFunc.createGame(game.p1, game.p2, true, game.turn, ((game.turn == 1) ? [1,2] : [2,1])).then(function(result){
        console.log(result);
        game.gameID = result['_id'];
        console.log(game.gameID);
    });

    // play card event
    game.p1S.on('playCard', function(e){
        if(game.turn == 1){
            if(game.p1.hand.includes(parseInt(e.cardNo))){
                const card = cards.find(card => card.cardNo === parseInt(e.cardNo));
                if(game.p1.playCard(card)){
                    console.log('game.p1 playing card: ' + e.cardNo);
                    console.log(card);
                    const cardIndex = game.p1.hand.indexOf(card.cardNo);
                    game.p1.hand.splice(cardIndex, 1);
                    game.p1.doLifesteal(game.p2.applyCard(card));
                    successTurn(game.p1S);
                    game.p2S.emit('lastCard', {cardNo: e.cardNo})
                    sendBoard(game.p1, game.p2, game.p1S, game.p2S);
                    winCheck = checkWin(game.p1, game.p2, game.p1S, game.p2S)
                    if(winCheck){
                        endGame(game.p1S, game.p2S, game.gameID, games);
                        dbFunc.updateGameWinner(game.gameID, game.p1, game.p2, game.turn, game.turnNum, game.round, winCheck).then(function(result){
                            console.log('db update successful');
                        }).catch(function(err){
                            console.log('error updating db');
                        })
                        return;
                    }
                }else{
                    sendCardWarning(game.p1S, "insufficient resources to play card");
                    console.log("insufficient resources to play card");
                }
            }else{
                sendCardWarning(game.p1S, "card not in hand");
                console.log("card not in hand");
            }
        }else{
            sendTurnWarning(game.p1S, 'its not your game.turn');
            console.log('its not your game.turn');
        }
        
    });

    game.p2S.on('playCard', function(e){
        if(game.turn == 2){
            if(game.p2.hand.includes(parseInt(e.cardNo))){
                const card = cards.find(card => card.cardNo === parseInt(e.cardNo));
                if(game.p2.playCard(card)){
                    console.log('game.p2 playing card: ' + e.cardNo);
                    console.log(card);
                    const cardIndex = game.p2.hand.indexOf(card.cardNo);
                    game.p2.hand.splice(cardIndex, 1);
                    game.p2.doLifesteal(game.p1.applyCard(card));
                    successTurn(game.p2S);
                    game.p1S.emit('lastCard', {cardNo: e.cardNo})
                    sendBoard(game.p1, game.p2, game.p1S, game.p2S);
                    winCheck = checkWin(game.p1, game.p2, game.p1S, game.p2S)
                    if(winCheck){
                        endGame(game.p1S, game.p2S, game.gameID, games);
                        dbFunc.updateGameWinner(game.gameID, game.p1, game.p2, game.turn, game.turnNum, game.round, winCheck).then(function(result){
                            console.log('db update successful');
                        }).catch(function(err){
                            console.log('error updating db');
                        })
                        return;
                    }
                }else{
                    sendCardWarning(game.p2S, "insufficient resources to play card");
                    console.log("insufficient resources to play card");
                }
            }else{
                sendCardWarning(game.p2S, "card not in hand");
                console.log("card not in hand");
            }
        }else{
            sendTurnWarning(game.p2S, 'its not your game.turn');
            console.log('its not your game.turn');
        }
    });

    // end game.turn event
    game.p1S.on('endTurn', function(e){
        if(game.turn == 1){
            console.log('ending game.p1 game.turn');
            game.p1.turnEnd();
            game.turn = 2;
            game.turnNum ++;
            game.round = Math.ceil(game.turnNum/2);
            winCheck = checkWin(game.p1, game.p2, game.p1S, game.p2S)
            if(winCheck){
                endGame(game.p1S, game.p2S, game.gameID, games);
                dbFunc.updateGameWinner(game.gameID, game.p1, game.p2, game.turn, game.turnNum, game.round, winCheck).then(function(result){
                    console.log('db update successful');
                }).catch(function(err){
                    console.log('error updating db');
                })
                return;
            }
            if(!drawManager(game.p2, game.round)){
                overDraw(game.p1S, game.p2S, 1);
                endGame(game.p1S, game.p2S, game.gameID, games);
                dbFunc.updateGameWinner(game.gameID, game.p1, game.p2, game.turn, game.turnNum, game.round, 1).then(function(result){
                    console.log('db update successful');
                }).catch(function(err){
                    console.log('error updating db');
                })
                return;
            }
            sendTurn(game.p1S, game.p2S, game.turn);
            sendBoard(game.p1, game.p2, game.p1S, game.p2S);
            dbFunc.updateGameTurn(game.gameID, game.p1, game.p2, game.turn, game.turnNum, game.round).then(function(result){
                console.log('db update successful');
            }).catch(function(err){
                console.log('error updating db');
            });
            console.log(game.p1);
            console.log(game.p2);
        }else{
            console.log('not your game.turn ', game.turn)
        }
    });

    game.p2S.on('endTurn', function(e){
        if(game.turn == 2){
            console.log('ending game.p2 game.turn');
            game.p2.turnEnd();
            game.turn = 1;
            game.turnNum ++;
            game.round = Math.ceil(game.turnNum/2);
            winCheck = checkWin(game.p1, game.p2, game.p1S, game.p2S)
            if(winCheck){
                endGame(game.p1S, game.p2S, game.gameID, games);
                dbFunc.updateGameWinner(game.gameID, game.p1, game.p2, game.turn, game.turnNum, game.round, winCheck).then(function(result){
                    console.log('db update successful');
                }).catch(function(err){
                    console.log('error updating db');
                })
                return;
            }
            if(!drawManager(game.p1, game.round)){
                overDraw(game.p1S, game.p2S, 2);
                endGame(game.p1S, game.p2S, game.gameID, games);
                dbFunc.updateGameWinner(game.gameID, game.p1, game.p2, game.turn, game.turnNum, game.round, 2).then(function(result){
                    console.log('db update successful');
                }).catch(function(err){
                    console.log('error updating db');
                })
                return;
            }
            sendTurn(game.p1S, game.p2S, game.turn);
            sendBoard(game.p1, game.p2, game.p1S, game.p2S);
            dbFunc.updateGameTurn(game.gameID, game.p1, game.p2, game.turn, game.turnNum, game.round).then(function(result){
                console.log('db update successful');
            }).catch(function(err){
                console.log('error updating db');
            });
            console.log(game.p1);
            console.log(game.p2);
        }else{
            console.log('not your game.turn ', game.turn)
        }
        
    });
    
    game.p1S.on('disconnect', function(){
        if(!checkWin(game.p1, game.p2, game.p1S, game.p2S)){
            game.p2S.emit('winner', {winner: 2});
            gameRunning = false;
        }
        game.p2S.disconnect();
        cleanup(players, sockets, game.gameID, games);
    })

    game.p2S.on('disconnect', function(){
        if(!checkWin(game.p1, game.p2, game.p1S, game.p2S)){
            game.p1S.emit('winner', {winner: 1});
            gameRunning = false;
        }
        game.p1S.disconnect();
        cleanup(players, sockets, game.gameID, games);
    })
    
};

// *****************************utility functions**************************** 

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
    return player.drawSpell(1);
}

function successTurn(playerSocket){
    playerSocket.emit('successCard', {msg: 'success playing card'});
}

function sendCardWarning(playerSocket, msg){
    playerSocket.emit('ERR_cardError', {status: "error",msg: msg})
}

function sendTurnWarning(playerSocket, msg){
    playerSocket.emit('WARN_turn', {msg: msg})
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
    p1c['deck_element'] = p2c['deck_element'] = p1e['deck_element'] = p2e['deck_element'] = [];
    p1c['cur_deck_element'] = p2c['cur_deck_element'] = p1e['cur_deck_element'] = p2e['cur_deck_element'] = []
    p1c['deck_spell'] = p1e['deck_spell'] = [p1['deck_spell'].length];
    p2c['deck_spell'] = p2e['deck_spell'] = [p2['deck_spell'].length];
    p1e['hand'] = [p1['hand'].length];
    p2e['hand'] = [p2['hand'].length];
    p1S.emit('Board:State', {you: p1c, enemy: p2e});
    p2S.emit('Board:State', {you: p2c, enemy: p1e});
}

function cleanup(players, sockets, gameID, games){
    var IDs = Object.keys(players);
    for(var i = 0; i < players.IDs; i++){
        delete players[IDs[i]];
        delete sockets[IDs[i]];
    }
    delete games[gameID]
}

function endGame(p1S, p2S, gameID, games){
    p1S.disconnect();
    p2S.disconnect();
    cleanup(players, sockets, gameID, games);
    console.log('finished');
    gameRunning = false;
    return;
}

function checkWin(p1, p2, p1S, p2S){
    if (p1['health'] <= 0){
        p1S.emit('winner', {winner: 2})
        p2S.emit('winner', {winner: 2})
        return 2;
    }
    if (p2['health'] <= 0){
        p1S.emit('winner', {winner: 1})
        p2S.emit('winner', {winner: 1})
        return 1;
    }
    return 0;
}

function overDraw(p1S, p2S, winnerNum){
    p1S.emit('winner', {winner: winnerNum})
    p2S.emit('winner', {winner: winnerNum})
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

mainLoop();