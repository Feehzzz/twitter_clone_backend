const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transport = require('../module/mailer');

const genToken = (params = {}) => {
    return jwt.sign(params, process.env.secret, {
        expiresIn: '1h',
    });
}
const validateEmail = (email) => {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

module.exports = {
    
    async store(req, res) {
        const { username, email, password, password2 } = req.body;
        try {

            let user = await User.findOne({ email });
            if (user) res.status(400).json({ error: "E-mail já cadastrado" });
            if (!username || !email || !password || !password2) res.status(400).json({ error: "Por favor, preencha todos os campos" })
            if (!validateEmail(email)) res.status(400).json({ error: "E-mail em formato invalido" })

            if (password !== password2 || password.length < 8) res.status(400).json({ error: "Senhas não batem ou possuem menos de 8 caracteres" });
            user = new User({
                username: username.toLowerCase(),
                email: email.toLowerCase(),
                password
            });
            user.password = await bcrypt.hash(password, 10);
            await user.save();
            user.password = undefined;

            return res.json({
                user,
                token: genToken({ id: user.id })
            })
        } catch (error) {
            return res.status(400).json({ error: "Algo deu errado ", error });
        }

    },
    async auth(req, res) {
        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (!user) res.status(404).json({ error: 'Usuário não encontrado' });
            const match = await bcrypt.compare(password, user.password);

            if (!match) res.status(400).json({ error: "Senha Invalida" });

            const now = new Date
            user.lastLogon = now;
            await user.save();
            user.password = undefined;
            return res.json({
                user,
                token: genToken({ id: user.id })
            })
        } catch (error) {
            return res.status(401).json({ error: "Algo deu errado ", error });
        }
    },
    async forgot(req, res) {
        const { email } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) res.status(404).json({ error: "Usuário não encontrado" });
            const token = crypto.randomBytes(10).toString('hex');
            const now = new Date();

            now.setHours(now.getHours() + 1);
            await User.findByIdAndUpdate(user.id, {
                '$set': {
                    passResetToken: token.toLocaleUpperCase(),
                    passResetExpire: now,
                }
            })
            transport.sendMail({
                to: email,
                from: 'noreplysystem380@gmail.com',
                subject: 'Recovery password',
                template: 'forgot_password',
                context: { token },
            }, (err) => {
                if (err) res.status(400).json({ error: 'Error ', err })
                return res.send();

            })

        } catch (error) {
            return res.status(400).json({ error: "Algo deu errado no envio do e-mail, tente novamente ", error });
        }
    },
    async reset(req, res) {
        const { email, password, password2 } = req.body;
        const { token } = req.params;
        const now = new Date();
        try {

            const user = await User.findOne({ email });

            if (token !== user.passResetToken) res.status(400).json({ error: "Token invalido" });
            if (now > user.passResetExpire) res.status(400).json({ error: "Token expirado, gere um novo" });
            if (password !== password2 || password.length < 8) res.status(400).json({ error: "Senhas não batem ou possuem menos de 8 caracteres" });

            user.password = await bcrypt.hash(password, 10);
            user.passResetToken = null;
            await user.save();
            user.password = undefined;
            return res.send();


        } catch (err) {

            return res.status(400).send({ error: "Algo deu errado na recuperação de senha, tente novamente", err });

        }
    }
}
