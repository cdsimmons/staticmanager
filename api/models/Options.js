/**
* Manager.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var shortId = require('shortid');

module.exports = {
  autoPK: false,

  attributes: {
    id: {
      type: 'integer',
      columnName: 'id'
    },
    site: {
      type: 'string',
      defaultsTo: 'raaa',
      primaryKey: true
    },
    owner: { // Thinking about having this as a model, with site URL, PassFid, and Email... would then use PassFid to match up against the password DB
      model: 'Document'
    }
  }
};
