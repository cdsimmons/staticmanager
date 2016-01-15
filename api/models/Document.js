/**
* Manager.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var shortId = require('shortid');

module.exports = {
  autoPK: true,

  attributes: {
    id: {
      type: 'string',
      columnName: 'id',
      primaryKey: true,
      defaultsTo: function (){ return Document.generateId(); }
    },
    publicId: {
      type: 'string',
      unique: true,
      required: true,
      columnName: 'public_id',
      defaultsTo: function (){ return Document.generateId(); }
    },
    title: {
      type: 'string',
      required: true,
      columnName: 'title'
    },
    draft: {
      type: 'json',
      required: true,
      columnName: 'draft'
    },
    live: {
      type: 'json',
      columnName: 'live'
    },
    // Maybe there is another way to do this though... maybe I can use Model Passwords or something instead of PassId, and then omit it?
    // It's not really good to be returning a hashed value in any REST call...
    /*options: { // Thinking about having this as a model, with site URL, PassFid, and Email... would then use PassFid to match up against the password DB
      model: 'options'
    },
    options: { // Thinking about having this as a model, with site URL, PassFid, and Email... would then use PassFid to match up against the password DB
      type: 'json',
      columnName: 'options'
    }*/
    // options: {
    //   columnName: 'options',
    //   site: {
    //     type: 'json'
    //     columnName: 'public_id',
    //   }
    // }
    options: { // Thinking about having this as a model, with site URL, PassFid, and Email... would then use PassFid to match up against the password DB
      model: 'Options'
    }
    // Okay... I'm thinking... maybe a separate model is not a great idea... maybe I should have them as separate columns instead, as it's one-one anyway
    // site, email, password... and somehow ommitt password on REST responses... might need to do custom methods and remove the REST blueprints :/
  },

  beforeCreate: function(values, next) {
    console.log('RAAA');
    if(!values.live) {
      values.live = values.draft;
    }
    
    next();
  },

  generateId: function () {
    var id = shortId.generate();
    return id;
  }
};
