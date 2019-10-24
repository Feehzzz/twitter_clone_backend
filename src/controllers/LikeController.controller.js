// Importa a tabela Tweet
const Tweet = require('../models/Tweet');

// Exporta função para incrementar o campo likes no objeto da tabela
module.exports = {
    async store(req, res) {
        // Find by id para encontrar o tweet especifico que deseja-se incrementar
        const tweet = await Tweet.findById(req.params.id);

        tweet.set({ likes: tweet.likes + 1});
        
        await tweet.save();

        req.io.emit('like', tweet);

        return res.json(tweet);

    },

};