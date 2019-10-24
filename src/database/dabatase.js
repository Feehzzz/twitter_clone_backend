const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.connect(`mongodb://${process.env.db_user}:${process.env.db_pass}@${process.env.db_host}`, 
    {
     useNewUrlParser: true,
     useCreateIndex: true,
     useUnifiedTopology: true
    }
);

module.exports = mongoose;