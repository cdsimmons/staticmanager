// Credit:
// @adityamukho https://gist.github.com/adityamukho/6260759

var bcrypt = require('bcrypt');

function hashPassword(values, next) {
  bcrypt.hash(values.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    }
    values.password = hash;
    next();
  });
}

module.exports = {
  autoPK: false,

  attributes: {
    id: { // Need this to match up with the document, since many documents could have the same email...
      columnName: 'id',
      //required: true,
      unique: true,
      primaryKey: true
    },
    email: {
      type: 'email',
      required: true
    },
    password: {
      type: 'string',
      required: true,
      minLength: 6
    },
    // Override toJSON instance method to remove password value
    toJSON: function() {
      var obj = this.toObject();
      delete obj.password;
      return obj;
    },
    validPassword: function(password, callback) {
      var obj = this.toObject();
      if (callback) {
        //callback (err, res)
        return bcrypt.compare(password, obj.password, callback);
      }
      return bcrypt.compareSync(password, obj.password);
    }
  },
  // Lifecycle Callbacks
  beforeCreate: function(values, next) {
    hashPassword(values, next);
  },
  beforeUpdate: function(values, next) {
    if (values.password) {
      hashPassword(values, next);
    }
    else {
      //IMPORTANT: The following is only needed when a BLANK password param gets submitted through a form. Otherwise, a next() call is enough.
      User.findOne(values.id).done(function(err, user) {
        if (err) {
          next(err);
        }
        else {
          values.password = user.password;
          next();
        }
      });
    }
  }
};