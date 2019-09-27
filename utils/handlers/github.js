const GitHubStrategy = require("passport-github").Strategy;
const passport = require("passport");
const User = require("../models/user");

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  // Find or create a user
  return done(null, {});
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || " ",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || " ",
      callbackURL: "http://localhost:8000/account/github/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
      User.findOne({ id: profile.id }).exec((err, dbUser) => {
        if (dbUser) return cb(null, dbUser);
        var newUser = new User({
          id: profile.id,
          username: profile.username
          // Add other stuff too ..
        });
        newUser.save((err, done) => {
          if (err) return cb(err);
          if (done) return cb(null, done);
        });
      });
    }
  )
);
