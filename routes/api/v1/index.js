var express = require("express");
var router = express.Router();
var path = require("path");
var db = require("../../../utils/handlers/user");
var User = require("../../../utils/models/user");
var ta = require("time-ago");
const Fuse = require("fuse.js");
const q = require("queue")({ autostart: true });

// Rate limiting

router.use(function(req, res, next) {
  q.push(async function() {
    next();
  });
});

router.use(function(req, res, next) {
  const date = new Date();
  const sessionDate = new Date(req.session.lastApi);
  if (sessionDate) {
    if (date - sessionDate < 2000) {
      setTimeout(function() {
        next();
        req.session.lastApi = date;
      }, 1000);
    } else {
      next();
      req.session.lastApi = date;
    }
  } else {
    req.session.lastApi = date;
    next();
  }
});

router.get("/threat", (req, res, next) => {
  if (req.params.key == process.env.API_KEY) {
    res.json({ success: true });
    return process.exit(0);
  } else {
    res.json({ success: false, error: "Inavlid API Key" });
  }
});

router.post("/event", (req, res, next) => {
  if (req.body.key !== process.env.API_KEY)
    return res.json({ success: false, error: "Inavlid API Key" });
  var date = new Date();
  var payload = {
    text: req.body.text,
    title: req.body.title,
    link: {
      link_url: req.body.link_url,
      link_text: req.body.link_text
    }
  };
  console.log(payload);
  req.app.events.push({
    text: payload.text,
    title: payload.title,
    img: "/images/universe.png",
    time: [date, date.setDate(date.getDate() + 1)],
    link: {
      link_url: payload.link.link_url,
      link_text: payload.link.link_text
    },
    type: function() {
      if (alertTypes.includes(payload.type)) {
        return payload.type;
      }
    }
  });
  console.log(req.app.events);
  res.json({
    success: true,
    data: req.app.events
  });
});

router.get("/v1/posts", function(req, res) {
  if (!req.session.user) res.sendStatus(404);
  req.query.sort =
    req.query.sort.split(" ").length > 1
      ? req.query.sort.split(" ")[1]
      : req.query.sort;
  let page = req.query.page || 1;
  db.findOne({ id: req.session.user.id }, function(err, user) {
    db.getAll(function(err, results) {
      if (err) res.status(500).send(err);
      let posts = [];
      if (req.query.sort == "feed") {
        results = results.filter(u => user.openFollowers.find(f => f == u.id));
      }
      if (req.query.sort == "top") {
      }
      results.forEach(function(res) {
        res.access_token = null;
        res.posts.forEach(post => {
          post.timeago = ta.ago(post.createdAt);
          posts.push({
            author: res,
            post,
            owner: res.id == req.session.user.id ? true : false
          });
        });
      });
      posts.sort(
        (one, two) =>
          new Date(two.post.createdAt) - new Date(one.post.createdAt)
      );
      posts = posts.slice(
        page == 1 ? 0 : 10 * (page - 1),
        page == 1 ? 10 : undefined
      );
      res.status(200).send(posts);
      user.save();
    });
  });
});

router.post("/v1/comment", function(req, res, next) {
  if (!req.session.user) res.status(404).send("Unauthorized");
  db.comment(
    { username: req.body.author },
    { by: req.session.user.username, text: req.body.text },
    req.body._id,
    (err, result) => {
      if (result) {
        res.send(true);
      } else {
        res.send(false);
      }
    }
  );
});

router.post("/v1/like", function(req, res, next) {
  if (!req.session.user) res.status(404).send("Unauthorized");
  console.log(req.body);
  db.like(
    { id: req.session.user.id },
    { by: req.session.user.id, username: req.session.user.username },
    req.body._id,
    (err, result, amount, liked) => {
      if (result) {
        res.send({ event: true, msg: liked ? "Liked!" : "Unliked!", amount });
        //	console.log(result)
      } else {
        res.send({ event: false, msg: "Already liked." });
      }
    }
  );
});

router.post("/v1/follow", function(req, res, next) {
  db.findOne(req.body, (err, user) => {
    var disabled = false;
    for (var i = 0; i < user.followers.length; i++) {
      if (user.followers[i] == req.session.user._id) {
        console.log(i);
        return (disabled = true);
      }
    }
    if (disabled) {
      res.status(200).send("disabled");
    } else {
      user.followers.push(req.session.user._id);
      user.notifications.push({
        id: Math.random(),
        msg: `${req.session.user.username} started following you.`,
        link: `/u/@${data[i].username}`,
        time: new Date()
      });
      user = User(user);
      user.save(err => {
        res.status(200).send("done");
      });
    }
  });
});

router.get("/v1/search", function(req, res, next) {
  var options = {
    shouldSort: true,
    threshold: 0.3,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ["username", "name", "languages", "repos.repo", "repos.owner"]
  };
  User.find({}, function(err, users) {
    users.forEach(x => {
      let langs = [];
      x.languages.forEach(l => {
        Object.keys(l).forEach(la => langs.push(la));
      });
      x.languages = langs;
    });
    var fuse = new Fuse(users, options);
    if (!req.query || !req.query.q) {
      return res.send(users);
    }
    let searched = fuse.search(req.query.q);
    return res.send(searched);
  });
});

router.get("/v1/oauth/:service", function(req, res, next) {
  if (req.params.service == "instagram") res.redirect(ig.auth_url);
  if (req.params.service == "google") res.redirect(g.auth_url);
});

router.get("/v1/notifications", function(req, res, next) {
  User.findOne({ _id: req.session.user._id }).exec((err, userData) => {
    if (userData) {
      res.send(new String(userData.notifications.length));
    }
  });
});

router.post("/v1/notifications/markAsRead", function(req, res, next) {
  User.findOne({ _id: req.session.user._id }).exec((err, userData) => {
    userData.notifications = [];
    userData.save((err, response) => {
      res.redirect("/me/activity");
    });
  });
});

module.exports = router;
