const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Schema for Deck
 * @type {*|Mongoose.Schema}
 */
const DeckSchema = new Schema({
    id: {
        type: String
    },
    name: {
        type: String,
        required: true,
        min: 1
    },
    cards: [],
    backgrounds: [],
    image: {
        type: String,
        default: '/uploads/back.png'
    },
    description_en: {
        type: String
    },
    description_il: {
        type: String
    },
    description_spa: {
        type: String
    },
    description_zh: {
        type: String
    },
    description_ukr: {
        type: String
    },
    description_pl: {
        type: String
    },
    description_cz: {
        type: String
    },
    short_description_en: {
        type: String
    },
    short_description_il: {
        type: String
    },
    short_description_spa: {
        type: String
    },
    short_description_zh: {
        type: String
    },
    short_description_ukr: {
        type: String
    },
    short_description_pl: {
        type: String
    },
    short_description_cz: {
        type: String
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    price_year: {
        type: Number,
        required: true,
        default: 0
    },
    deck_id: {
        type: Schema.Types.ObjectId
    },
    subscribed: {
        type: String,
        default: false
    },
    subscribedUntil: {
        type: Date,
        default: null
    },
    playable: {
        type: Boolean,
        default: null
    },
    keywords: {
        type: String
    },
    languages: {
        type: String
    },
    order: {
        type: Number,
        min: 1,
        default: 1
    },
    played: {
        type: Boolean,
        default: false
    },
    forms: {
        type: [],
        default: []
    }
});

module.exports = mongoose.model('Deck', DeckSchema);
