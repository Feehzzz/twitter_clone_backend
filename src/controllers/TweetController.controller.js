// Importa a tabela Tweet
const Tweet = require('../models/Tweet');

// Exporta funções para criação de tweet e listagem
module.exports = {
    async index(req, res) {
        const tweets = await Tweet.find({}).sort('-createdAt');

        return res.json(tweets);

    },

    async store(req, res) {
        const { content } = req.body
        const tweet = await Tweet.create({
            author: req.userId,
            content
        });

        req.io.emit('tweet', tweet);

        return res.json(tweet);

    }
};