/**
 * ManagerController
 *
 * @description :: Server-side logic for managing Managers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var fs = require('fs');


module.exports = {
  index: function (req, res) {
    // var socket = req.socket;
    // var io = sails.io;
 
    // // emit to all sockets (aka publish)
    // // including yourself
    // io.sockets.emit('connect', {thisIs: 'theMessage'});
    // socket.join('roomName');
    return res.view();
  },

  find: function(req, res) {
    res.setHeader('Content-Type', 'text/javascript'); 

    var renderer = '';
    var data = '';
    var lib = '';
    
    //res.send(__dirname+'../js/handlebars.js');

    var done = _.after(3, function() {
      var response = renderer+data+lib;
      res.send(response);
    });

    Document.find({ publicId: req.params.id }).exec(function (err, document){
      if (err) {
        return console.log('js.find.document', err);
      }

      data = 'var smData = {"sm": '+JSON.stringify(document[0].live)+'}';

      done();
    });

    fs.readFile(__dirname+'/../js/handlebars.min.js', 'utf8', function (err, file) {
      if (err) {
        console.log('js.find.readFile.renderer', err);
      }

      renderer = file;

      done();
    });

    fs.readFile(__dirname+'/../js/lib.js', 'utf8', function (err, file) {
      if (err) {
        console.log('js.find.readFile.renderer', err);
      }

      lib = file;

      done();
    });
  },
  
  
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to MainController)
   */
  _config: {}

};
