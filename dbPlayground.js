var dbHelper = require('./mongoHelper')
var Game = require('./Models/game')
var dbFunc = require('./dbFunctions')
var Player = require('./Classes/player');

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

// dbFunc.createPlayer("testing").then(function(result){
//     console.log(result);
// });

// var x;

// dbFunc.getCards().then(function(results){
//     // console.log(results);
//     x = results
// })
// console.log(x)

var cards;
var cardIDs;
dbFunc.getCards().then(function(results){
    cards = results;
    cardIDs = cards.map(function(card){
        return card["cardNo"];
    });
    console.log("got cards");
    testMain();
});

function testMain(){
    var selected = cards.find(card => card.cardNo === 4);
    console.log('selected: ' + selected.earth_req);

    var turn = 2;
    var p1 = new Player();
    var p2 = new Player();
    p1['deck_spell'] = randomDeck(cardIDs);
    p1['deck_element'] = randomElement();
    p2['deck_spell'] = randomDeck(cardIDs);
    p2['deck_element'] = randomElement();

    p1.drawSpell(5);
    p2.drawSpell(5);
    p1.slow = 1;
    // p1.armor = 4;
    p1.earth = 4;
    // p1.applyCard(cards.filter(card => card.cardNo === 1)[0]);
    p1.playCard(selected)
    console.log(p1);
    // p1.turnEnd();
    // console.log(p1);
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
    var pool = [1,1,1,1,1,1,1,1,1,1,
                2,2,2,2,2,2,2,2,2,2,
                3,3,3,3,3,3,3,3,3,3]
    return shuffle(pool);
}




// dbFunc.createGame(p1, p2, true, turn, ((turn == 1) ? [1,2] : [2,1])).then(function(result){
//     console.log(result._id);
//     dbFunc.getGame(result._id).then(function(result){
//         console.log(result);
//     })
// })

// console.log(p1);
// p1.drawSpell();
// p1.drawSpell();
// p1.drawSpell();
// p1.drawSpell();
// p1.drawElement();
// console.log(p1);

// var ranNums = shuffle([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);

// console.log(ranNums)