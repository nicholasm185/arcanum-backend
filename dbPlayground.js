var dbHelper = require('./mongoHelper')
var Game = require('./Models/game')
var dbFunc = require('./dbFunctions')

// // create new entry and find the entry right away
// dbFunc.createGame("this is a", "new entry", true).then(function(result){
//     console.log(result._id);
//     dbFunc.getGame(result._id).then(function(result){
//         console.log(result);
//     }).catch(function(){
//         console.log("borked at 2");
//     });
// }).catch(function(){
//     console.log("borked at 1");
// });

// // update and then print results
// dbFunc.updateGameTurn("5fcb58895018b05008aabcf6", 30).then(function(result){
//     console.log(result);
//     dbFunc.getGame(result._id).then(function(result){
//         console.log(result);
//     });
// });

dbFunc.createPlayer("testing").then(function(result){
    console.log(result);
});