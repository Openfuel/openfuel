const GitHubStrategy = require("passport-github").Strategy;
const passport = require("passport");
const User = require("../models/user");

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || " ",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || " ",
      callbackURL: "http://localhost:8000/account/github/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
      //Do stuff here
      cb();
    }
  )
);
