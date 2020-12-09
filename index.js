// third party imports
var io = require('socket.io')(process.env.PORT || 8080);


// local imports
var Player = require('./Classes/player');

var players = [];
var sockets = [];


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
        })

        socket.on('disconnect', function(){
            console.log('connection lost');
            delete players[thisPlayerID];
            delete sockets[thisPlayerID];
        })

        if(Object.keys(players).length == 2){
            console.log("game ready to start");
            mainGameLoop(players, sockets);
        };
    } 
    else{
        socket.emit('ERR_servFull', {status: "error",msg: 'server is full', curNumPlayers: Object.keys(players).length});
        console.log('connection attempted but server is full');
        socket.disconnect();
    };
    
});

function randomizeCard(){

};

function mainGameLoop(players, sockets){
    // get randomized turn
    var turn = Math.round(Math.random()) + 1;
    console.log("Game commencing; get ready!");

    // get player objects from players
    var IDs = Object.keys(sockets);
    p1 = players[IDs[0]];
    p2 = players[IDs[1]];

    // get each player's sockets from sockets, telling their turn number
    p1S = sockets[IDs[0]];
    p1S.emit('playerNumber', {you: 1});
    p2S = sockets[IDs[1]];
    p2S.emit('playerNumber', {you: 2});

    // tell the current turn to all players
    p1S.emit('curTurn', {curTurn: turn});
    p2S.emit('curTurn', {curTurn: turn});
    
    console.log('turn: ' + turn)
    console.log('player 1: ' + p1);
    console.log('player 2: ' + p2);

    // test function for both players
    p1S.on('yeet', function(e){
        if(turn == 1){
            console.log("player 1 yeeted");
            turn = 2;
            p2.doDamage(1);
            p1S.emit('Board:State', {you: p1, enemy: p2});
            p2S.emit('Board:State', {you: p2, enemy: p1});
        }
        else{
            console.log('p1 tried to yeet when its not their turn');
            p1S.emit('WARN_turn', {msg: "it's not your turn"})
        }
    });

    p2S.on('yeet', function(e){
        if(turn == 2){
            console.log("player 2 yeeted");
            turn = 1;
            p1.doDamage(1);
            p1S.emit('Board:State', {you: p2, enemy: p1});
            p2S.emit('Board:State', {you: p1, enemy: p2});
        }
        else{
            console.log('p2 tried to yeet when its not their turn');
            p2S.emit('WARN_turn', {msg: "it's not your turn"});
        }
    });
    
    
};

