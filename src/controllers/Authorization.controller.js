const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader)
    return res.status(401).send({ error: 'Token não definido'});

    const parts = authHeader.split(' ');
    if (!parts.length === 2)
        return res.status(401).send({error: 'Token error'});

    const [ scheme, token ] = parts;
    // verifica se o token possui o bearer por padrão do jwt

    if(!/^Bearer$/i.test(scheme))
        return res.status(401).send ({ error: 'Token em formato invalido'});
    
    jwt.verify(token, process.env.secret, (err, decoded) => {
        if (err) return res.status(401).send({error: 'Token invalido'});

        req.userId = decoded.id;
        return next();
    });
};