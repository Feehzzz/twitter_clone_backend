//Definição da tabela Tweet
const mongoose = require('../database/dabatase');

const TweetSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: String,
    likes: {
        type: Number,
        default: 0,
    },
    liked: {
        type: Array,
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Tweet', TweetSchema);