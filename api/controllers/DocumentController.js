/**
 * ManagerController
 *
 * @description :: Server-side logic for managing Managers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
//var _ = require('lodash');


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

  needLogin: function(req, res) {
    Document.find({ id: req.params.id }).exec(function (err, document){
      // Only `.watch()` for new instances of the model if
      // `autoWatch` is enabled.
      if (document.options.password) {
        Document.subscribe(req, manage);
      }

      res.send(JSON.stringify(manage[0], null, 4));
    });
  },

  /*find: function(req, res) {
    // var socket = req.socket;
    // var io = sails.io;
 
    // emit to all sockets (aka publish)
    // including yourself
    //io.sockets.emit('connect', {thisIs: 'theMessage'});
    //Document.watch(req.socket);


    Document.find({ uniqueUrl: req.params.uniqueUrl }).exec(function (err, manage){
      // Only `.watch()` for new instances of the model if
      // `autoWatch` is enabled.
      if (req.isSocket) {
        Document.subscribe(req, manage);
      }

      res.send(JSON.stringify(manage[0], null, 4));
    });
  },*/

  /*update: function(req, res) {
    console.log(req);
    var params = req.params.all();
    var json = params.json;
    var id = params.id;

    // Try to process string as JSON
    // try {
    //   json = JSON.parse(params.json);
    // } catch (e) {
    //   res.send('Invalid JSON.');
    //   res.serverError();
    // }

    // var io = sails.io;
    // io.sockets.emit('update', {thisIs: 'theMessage'});

    Document.update({ id: id}, {json: json}).exec(function (err, manage){
      console.log('manage', manage);
      console.log('id',manage[0].id);
      if (req.isSocket) { 
        Document.subscribe(req, manage);
      }

      Document.publishUpdate(manage[0].id, manage);

      res.send(JSON.stringify(manage[0], null, 4));
    });
  },*/

/*
  create: function(req, res) {
    var manage;
    var params = req.params.all();

    // Try to create a DB entry with passed parameters and generated ID's
    Document.create({title: params.title, json: params.json}).done(function(err, created){
      if (err) {
        // It's possible that a unique ID isn't actually unique, but in the model, we're saying it has to be unique...
        res.send(err);
        res.serverError();
        console.log('manager.create',err);
            // badRequest.js  - 400 - res.badRequest()
            // notFound.js    - 404 - res.notFound()
            // forbidden.js   - 403 - res.forbidden()
            // serverError.js - 500 - res.serverError()
      } else {
        // If we have the pubsub hook, use the model class's publish method
        // to notify all subscribers about the created item
        // if (req._sails.hooks.pubsub) {
        //   if (req.isSocket) {
        //     Document.subscribe(req, created);
        //     Model.introduce(created);
        //   }
        //   Document.publishCreate(created, !req.options.mirror && req);
        // }

        res.send(created);
      }
    });
  },*/
  
  
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to MainController)
   */
  _config: {}

};
