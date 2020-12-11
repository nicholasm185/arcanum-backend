var mongoose = require('mongoose');

var subSchema = new mongoose.Schema({
    playerName:{
        type: String,
        required: false
    },
    gameId:{
        type: String
    },
    health:{
        type: Number,
        required: true,
        default: 30
    },
    earth:{
        type: Number,
        default: 0
    },
    fire:{
        type: Number,
        default: 0
    },
    water:{
        type: Number,
        default: 0
    },
    hand:{
        type: [String],
        default: []
    },
    deck_spell:{
        type: [String],
        default: []
    },
    deck_element:{
        type: [String],
        default: []
    },
    burn:{
        type: Number,
        default: 0
    },
    slow:{
        type: Number,
        default: 0
    },
    armor:{
        type: Number,
        default: 0
    },
    lifesteal:{
        type: Number,
        default: 0
    },
});

var schema = new mongoose.Schema({
    p1: {
        type: subSchema,
        default: null
    },
    p2: {
        type: subSchema,
        default: null
    },
    gamestate: {
        type: Boolean,
        required: true
    },
    cur_turn: {
        type: Number,
        default: 1
    },
    winner: {
        type: String,
        default: null
    },
    gameStartTime: {
        type: Date,
        default: new Date().toISOString()
    },
    totalTurn: {
        type: Number,
        default: 1
    },
    playerOrder: {
        type: [Number],
        required: true
    }
});

var game = new mongoose.model('Game', schema);

module.exports = game;