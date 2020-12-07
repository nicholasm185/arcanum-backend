// third party imports
var io = require('socket.io')(process.env.PORT || 52300);


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

function mainGameLoop(players, sockets){
    var turn = Math.floor(Math.random());
    console.log("welcome to the jungleeee where idk fauclake");
    var IDs = Object.keys(sockets);
    p1 = sockets[IDs[0]];
    p2 = sockets[IDs[1]];
    console.log('turn: ' + turn)
    console.log('player 1: ' + p1);
    console.log('player 2: ' + p2);

    p1.on('yeet', function(e){
        if(turn == 0){
            console.log("player 1 yeeted");
            turn = 1;
        }
        else{
            console.log('p1 tried to yeet when its not their turn');
            p1.emit('WARN_turn', {msg: "it's not your turn"})
        }
    });

    p2.on('yeet', function(e){
        if(turn == 1){
            console.log("player 2 yeeted");
            turn = 0;
        }
        else{
            console.log('p2 tried to yeet when its not their turn');
            p2.emit('WARN_turn', {msg: "it's not your turn"});
        }
    });
    // p1.emit('playerInfo', {player: 1});
    // p2.emit('playerInfo', {player: 2});
    
    
};

