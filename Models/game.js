var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    p1: {
        type: String,
        default: null
    },
    p2: {
        type: String,
        default: null
    },
    gamestate:{
        type: Boolean,
        required: true
    },
    cur_turn:{
        type: Number,
        default: 1
    },
    winner:{
        type: String,
        default: null
    }
});

var game = new mongoose.model('Game', schema);

module.exports = game;