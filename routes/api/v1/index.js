var express = require("express");
var router = express.Router();
var path = require("path");
var tool = require("array-tools");
var db = require("../../../utils/handlers/user");
var User = require("../../../utils/models/user");
var formParser = require("../../../utils/form-parser.js");
var formidable = require("formidable");
var fs = require("file-system");

router.get('/threat', (req, res, next) => {
    if (req.params.key == process.env.API_KEY) {
        res.json({ success: true })
        return process.exit(0);
    } else {
        res.json({ success: false, error: "Inavlid API Key" });
    }
});

router.post('/event', (req, res, next) => {
    if (req.body.key !== process.env.API_KEY) return res.json({ success: false, error: "Inavlid API Key" })
    var date = new Date();
    var payload = {
      text:req.body.text,
      title:req.body.title,
      link: {
        link_url: req.body.link_url,
        link_text: req.body.link_text
      }
    }
    console.log(payload)
    req.app.events.push({
        text: payload.text,
      title: payload.title,
        img: "/images/universe.png",
        time:[date,date.setDate(date.getDate() + 1)] ,
        link: {
            link_url: payload.link.link_url,
            link_text: payload.link.link_text
        },
        type: function () {
            if (alertTypes.includes(payload.type)) {
                return payload.type;
            }
        }
    });
    console.log(req.app.events)
    res.json({
        success: true,
        data: req.app.events
    })
});

router.post("/v1/comment", function(req, res, next) {
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
  //console.log(req.body);
  db.like(
    { username: req.body.author },
    { by: req.session.user.username },
    req.body._id,
    (err, result) => {
      if (result) {
        res.send({ event: true, msg: "Liked!" });
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
  var regx = "^" + req.query.q + ".*";
  User.find({
    $or: [
      { username: { $regex: regx } },
      { firstname: { $regex: regx } },
      { lastname: { $regex: regx } }
    ]
  }).exec((err, all) => {
    return res.send(all);
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
