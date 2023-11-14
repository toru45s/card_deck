const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Schema for Transaction
 * @type {*|Mongoose.Schema}
 */

// 5f59d27ca70e034172e7b773
const TransactionSchema = new Schema({

    user_id: {
        type: String,
        required: true
    },
    coupons_id: {
        type: String,
        required: true
    },
    used_count: {
        type: Number,
        required: true
    },
    status: {
        type: Number
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('UsedCoupons', TransactionSchema);
