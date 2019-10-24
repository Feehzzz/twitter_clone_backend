//Definição da tabela Tweet
const mongoose = require('../database/dabatase');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastLogon: {
        type: Date,
        default: Date.now
    },
    passResetToken: {
        type: String,
    },
    passResetExpire: {
        type: Date,
    }
});

module.exports = mongoose.model('User', UserSchema);