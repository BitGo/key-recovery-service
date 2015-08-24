var mongoose = require('mongoose');

// if running in an environment with mongolab, go ahead and use it
if (process.env['MONGOLAB_URI']) {
 process.config.mongouri = process.env['MONGOLAB_URI'];
}

// make a new database connection and define the collections
mongoose.connect(process.config.mongouri);

module.exports = mongoose;