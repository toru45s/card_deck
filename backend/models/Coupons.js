const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Schema for Card
 * @type {*|Mongoose.Schema}
 */
const CouponsSchema = new Schema({
    deck_id: {
        type: String,
    },
    deck_name: {
        type: String,
    },
    number_of_coupons: {
        type: Number,
        default: 0
    },
    code:{
        type: String,
        required: true
    },
    codeName:{
        type: String,
        required: true
    },
    code_type:{
        type: String,
        required: true
    },
    reduction: {
        type: Number,
        default: 0
    },
    used_count: {
        type: Number,
        default: 0
    },
    max_user_apply: {
        type: Number,
        default: 0
    },
    expiry_date: {
        type: Date,
        default: null
    },
    start_date: {
        type: Date,
        default: null
    },
    status: {
        type: String
    },
    subscription_length: {
        type: Number,
        default: null
    }

},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }});

module.exports = mongoose.model('Coupons',CouponsSchema);

// 5f59d27ca70e034172e7b773