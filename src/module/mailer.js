const nodemailer = require('nodemailer');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');

const transport = nodemailer.createTransport({
  host: process.env.nodem_host,
  port: process.env.nodem_port,
  secure: true,
  auth: {
    user: process.env.nodem_user,
    pass: process.env.nodem_pass,
  },
});

const handlebarOptions = {
  viewEngine: {
    extName: '.html',
    partialsDir: path.resolve('./src/module/mail/'),
    layoutsDir: path.resolve('.src/module/mail/'),
    defaultLayout: '',
  },
  viewPath: path.resolve('./src/module/mail/'),
  extName: '.html',
};
transport.use('compile', hbs(handlebarOptions));

module.exports = transport;
