var mongoose = require('mongoose');

// make a new database connection and define the collections
mongoose.connect('mongodb://localhost/' + process.config.dbname);

module.exports = mongoose;