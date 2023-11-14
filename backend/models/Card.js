const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Schema for Card
 * @type {*|Mongoose.Schema}
 */
const CardSchema = new Schema({
    deck_id: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true,
    },
    form: {
        type: String
    }
});

module.exports = mongoose.model('Card', CardSchema);
