var express = require("express");
var router = express.Router();
var user = require("../utils/handlers/user");
var ta = require("time-ago");
var array_tools = require("array-tools");

router.get("/", function(req, res, next) {
  if (req.session.user) {
   user.getAll((err, users) => {
      for (var i = 0; i < users.length; i++) {
        for (var j = 0; j < users[i].posts.length; j++) {
          users[i].posts[j].timeago = ta.ago(users[i].posts[j].createdAt);
        }
      }
      var posts = [];
     user.findOne({ username: req.session.user.username }, (error, req_user) => {
        res.render("index", {
          user: req_user,
          title: req.app.conf.name,
          people: users,
          events:req.app.events,
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
