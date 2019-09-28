const GitHubStrategy = require("passport-github").Strategy;
const passport = require("passport");
const User = require("../models/user");
const github = require("./githubresume");

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
        console.info(profile)
        github(profile.username, data => {
          var newUser = new User({
            id: profile.id,
            username: profile.username,
            profile_url: profile._json.avatar_url,
            email: profile._json.email,
            profile_picture: profile.photos[0].value,
            name: profile._json.name,
            website: profile._json.blog,
            location: profile._json.location,
            hirable: profile._json.hirable,
            bio: profile._json.bio,
            since: data.since,
            created_at: data.created_at,
            repos: data.repos,
            gists: profile._json.public_gists,
            user_status: data.userStatus,
            new: data.earlyAdopter,
            followers: data.followers,
            following: profile._json.following,
            access_token: accessToken,
            refresh_token: refreshToken
          });
          newUser.save((err, done) => {
            if (err) return cb(err);
            if (done) return cb(null, done);
          });
        });
      });
    }
  )
);
