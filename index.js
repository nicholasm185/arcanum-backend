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
        socket.broadcast.emit('hello', {msg: 'im here fuckassssss'})

        console.log('number of players connected: ' + Object.keys(players).length);

        socket.broadcast.emit('spawn', player);

        for(var playerID in players){
            if(playerID != thisPlayerID){
                socket.emit('spawn', players[playerID])
            }
        }


        socket.on('disconnect', function(){
            console.log('connection lost');
            delete players[thisPlayerID];
            delete sockets[thisPlayerID];
        })

        sockets.on

        if(Object.keys(players).length == 2){
            console.log("game ready to start");
            mainGameLoop(players, sockets);
        }
    } 
    else{
        socket.emit('ERR_servFull', {status: "error",msg: 'server is full', curNumPlayers: Object.keys(players).length});
        console.log('connection attempted but server is full')
        socket.disconnect();
    };
    
});

function mainGameLoop(players, sockets){
    console.log("welcome to the jungleeee where idk fauclake");
    console.log(players);
    console.log(sockets);
};

// const mongoHelper = require("./mongoHelper");

// const { MongoClient } = require('mongodb');

// async function main() {

//     const uri = "mongodb+srv://root:DeeZnkKwn03Z3qhb@cluster0.rbt3t.mongodb.net/arcanum?retryWrites=true&w=majority";

//     const client = new MongoClient(uri);

//     try {
//         // Connect to the MongoDB cluster
//         await client.connect();

//         // Make the appropriate DB calls
//         await mongoHelper.listDatabases(client);

//     } catch (e) {
//         console.error(e);
//     } finally {
//         // Close the connection to the MongoDB cluster
//         await client.close();
//     }
// }

// main().catch(console.error);

