var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    username:{
        type: String,
        required: true
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

var player = new mongoose.model('Player', schema);

module.exports = player;