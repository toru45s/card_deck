const mongoose = require('mongoose');
const { Schema } = mongoose;

const OptionSchema = new Schema({
    key: {
        type: String,
        unique: true,
        required: true,
        min: 1
    },
    value: {
        type: String
    },
});

module.exports = mongoose.model('Option', OptionSchema);