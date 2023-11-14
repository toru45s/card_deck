const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Schema for Transaction
 * @type {*|Mongoose.Schema}
 */
const TransactionSchema = new Schema({

    user_id: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    product_id: {
        type: String
    },
    plan_id: {
        type: String
    },
    subscription_id: {
        type: String
    },
    status: {
        type: Number,
        default: 0
    },
    interval: {
        type: String
    },
    coupon_id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    coupon_status: {
        type: String,
        default: null
    }

}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Transaction', TransactionSchema);
