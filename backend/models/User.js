const mongoose = require('mongoose');
const { Schema } = mongoose;
const Session = require('../models/Session');

const UserSchema = new Schema({
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: [true, "Email required"]
    },
    username: {
        type: String,
        unique: true,
        required: true,
        min: 1
    },
    password: {
        type: String,
        required: true,
        min: 1
    },
    decks: [],
    sessions: [Session],
    role: {
        type: Number,
        required: true,
        default: 1
    },
    message: {
        type: String,
        default: null,
        min: 1
    },
    trialUntil: {
        type: Date,
        default: null
    },
    trialEnded: {
      type: Boolean,
      default: false
    },
    fullSubscription: {
        type: Date,
        default: null
    },
    eula: {
        type: Boolean,
        default: true
    },
    resetToken: {
        type: String,
        default: null
    },
    socialId: {
        type: String,
        default: null
    },
    language: {
        type: String,
        default: 'en'
    },
    backgrounds: [],
    tutorial: {
        type: Number,
        default: 0
    },
    inviteCode: {
        type: String,
        default: () => this._id
    },
    multipleAllowed: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('User', UserSchema);
