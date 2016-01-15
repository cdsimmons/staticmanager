// Credit:
// @theangryangel https://gist.github.com/theangryangel/5060446
// @Mantish https://gist.github.com/Mantish/6366642
// @anhnt https://gist.github.com/anhnt/8297229

// We use passport to determine if we're authenticated
module.exports = function(req, res, next) {

  if (req.isAuthenticated())
    return next();

  // Should be a way of making this a bit quicker... like, req.session.authenticated in isAuthenticated, I don't even know what req.isAuthenticated does, since I'm pretty sure it's not the other policy
  // Here, I could check if we even need to authenticate (like, if the object has a user), if so we're fine, and set req.session.authenticated to true...
  //return next();

  if (req.wantsJSON)
    return res.forbidden('You are not permitted to perform this action.');

  req.flash('error', 'You must login before accessing this page.');
  res.redirect('/login');
};
