const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Schema for Transaction
 * @type {*|Mongoose.Schema}
 */

// 5f59d27ca70e034172e7b773
const NotesSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: Number
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Notes', NotesSchema);