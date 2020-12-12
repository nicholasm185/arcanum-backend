var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    cardNo: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    damage: {
        type: Number,
        required: true
    },
    burn: {
        type: Number,
        required: true
    },
    slow: {
        type: Number,
        required: true
    },
    regen: {
        type: Number,
        required: true
    },
    armor: {
        type: Number,
        required: true
    },
    lifesteal: {
        type: Number,
        required: true
    },
    earth_req: {
        type: Number,
        required: true
    },
    fire_req: {
        type: Number,
        required: true
    },
    water_req: {
        type: Number,
        required: true
    },
    cardDesc: {
        type: String,
        required: false,
    }
})

var card = new mongoose.model('Card', schema);

module.exports = card;