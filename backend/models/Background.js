const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Schema for Background
 * @type {*|Mongoose.Schema}
 */
const BackgroundSchema = new Schema({
    deck_id: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true,
    },
    order: {
        type: Number,
        default: 1
    },
    combo_id: {
        type: String,
        default: ""
    }
});

module.exports = mongoose.model('Background', BackgroundSchema);