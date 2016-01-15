// Start sails and pass it command line arguments
// forever -o out.log -w start app.js
require('sails').lift(require('optimist').argv);