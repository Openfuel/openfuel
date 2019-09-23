var express = require("express");
var router = express.Router();
var user = require("../utils/handlers/user");
var ta = require("time-ago");
var array_tools = require("array-tools");

router.get("/", function(req, res, next) {
  if (req.session._id && req.session.user) {
    user.getAll((err, users) => {
      for (var i = 0; i < users.length; i++) {
        for (var j = 0; j < users[i].posts.length; j++) {
          users[i].posts[j].timeago = ta.ago(users[i].posts[j].createdAt);
        }
      }
      var posts = [];
      user.findOne({ username: req.session.user }, (error, req_user) => {
        var lastSeen = ta.ago(req_user.lastLogin);
        res.render("index", {
          user: req_user,
          title: req.app.conf.name,
          lastSeen: lastSeen,
          people: users,
          posts: true
        });
      });
    });
  } else {
    res.render("land", {
      title: req.app.conf.name,
      error: false
    });
  }
});

module.exports = router;
