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

    async store(req, res){
        const {username,email, password, password2 } = req.body;
        try {
            
            let user = await User.findOne({email})
            if(user) res.status(400).json({error: "E-Mail already registered or username already used"})
            
            if(password !== password2 || password.length < 8) res.status(400).json({erorr: "Password doesn't match or has less than 8 caracteres"})
            if(validateEmail(email)){
                user = await User.create({
                    username: username.toLowerCase(),
                    email: email.toLowerCase(), 
                    password})
                user.password = await bcrypt.hash(password, 10)
                await user.save()
                user.password = undefined
            
                return res.json({
                    user, 
                    token: genToken({ id: user.id })
                })
            } else {
                return res.status(400).json({error: "Invalid format e-mail"})
            }
            
        } catch (error) {
            console.log(req.body)
            return res.status(400).json({error: "Something went wrong " + error})
        }
        
    },
    async auth(req, res){
        const {email, password } = req.body;
        try {
            let user = await User.findOne({email});
            if(!user) res.status(404).json({error: 'User not found'});
            const match = await bcrypt.compare(password, user.password);
            
            if(!match){
                return res.status(400).json({ error: "Wrong password"});
            } else {
                const now = new Date
                user.lastLogon = now;
                await user.save();
                user.password = undefined;
                return res.json({
                    user, 
                    token: genToken({ id: user.id})
                })
            }
        } catch (error) {
            return res.status(401).json({error: "Something went wrong " + error}) 
        }
    },
    async forgot(req, res){
        const { email } = req.body;
        try {
            const user = await User.findOne({ email });
            if(!user) res.status(404).json({ error: "User not found"})
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
                context: { token},
              }, (err) => {
                if (err) res.status(400).json({error: 'error' + err})
                return res.send()
                
              })

        } catch (error) {
            return res.status(400).json({error: "Something went wrong to recovery password " + error})
        }
    },
    async reset(req,res){
        const { email, password, password2 } = req.body;
        const { token } = req.params;
        const now = new Date();
        try {
          
          const user = await User.findOne({ email })
            
          if(token !== user.passResetToken) res.status(400).json({error: "Invalid token"})
          if(now > user.passResetExpire) res.status(400).json({error:"Token expired, generate a new"})
          if(password !== password2 || password.length < 8) res.status(400).json({error: "Password must have 8 caracteres or doesn't match"})
    
          user.password = await bcrypt.hash(password, 10);
          user.passResetToken = null;
          await user.save();
          user.password = undefined;
          return res.send()
    
         
        } catch (err) {
          
          return res.status(400).send({ error: "Something went wrong to reset password, try again " + err });
          
        }
    }


}
