const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Schema for Background
 * @type {*|Mongoose.Schema}
 */
const SessionSchema = new Schema({
    name: {
        type: String,
        required: true,
        min: 1
    },
    clientName: {
        type: String,
        default: "General"
    },
    decks: {
        type: Array
    }
});

module.exports = SessionSchema;
