var express = require("express");
var router = express.Router();
var user = require("../utils/handlers/user");
var ta = require("time-ago");
var array_tools = require("array-tools");
const Prism = require('prismjs');

router.get("/", function(req, res, next) {
  if (req.session.user) {
   const posts = [];
   user.getAll((err, users) => {
      for (var i = 0; i < users.length; i++) {
        for (var j = 0; j < users[i].posts.length; j++) {
          users[i].posts[j].timeago = ta.ago(users[i].posts[j].createdAt);
          if(users[i].posts[j].code) {
            users[i].posts[j].code = Prism.highlight(users[i].posts[j].code, Prism.languages.javascript, 'javascript')
          }
          posts.push({author: users[i], post: users[i].posts[j]})
        }
      }
      posts.sort((one, two) => {
        return (new Date(two.post.createdAt) - new Date(one.post.createdAt));
      })
     user.findOne({ id: req.session.user.id }, (error, req_user) => {
       req.app.events.map((a, b) => {
         if (a.time[1] < new Date()) {
           req.app.events.slice(a);
          }
        })
        res.render("index", {
          user: req_user,
          title: req.app.conf.name,
          people: users,
          events:req.app.events,
          posts: posts || false
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
