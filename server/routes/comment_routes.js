const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const Article = require('../models/article');
const intel = require('intel');

// *** api routes *** //
router.get('/comments', findAllComments);
router.get('/comment/:id', findCommentById);
router.post('/comment/:article_id', addComment);
router.put('/comment/:id', updateComment);
router.delete('/comment/:id', deleteComment);

// *** get ALL articles *** //
function findAllComments(req, res) {
  Comment.find()
  .populate('article')
  .exec(function(err, comments) {
    if(err) {
      res.json(err);
      intel.error("ERROR ", err);
    } else {
      res.json(comments);
      intel.info("Get all comments ", comments);
    }
  });
}

// *** get SINGLE article *** //
function findCommentById(req, res) {
  Comment.findById(req.params.id)
  .populate('article')
  .exec(function(err, comment) {
    if(err) {
      res.json(err);
      intel.error("ERROR ", err);
    } else {
      // console.log(comment.article.body);
      res.json(comment);
      intel.info('Get single comment by id ', comment);
    }
  });
}

// *** add SINGLE comment *** //
function addComment(req, res) {
  var newComment = new Comment({
    email: req.body.email,
    telephone: req.body.telephone,
    body: req.body.body,
    confirmation: req.body.confirmation,
    time: req.body.time,
    article: req.params.article_id
  });

  Article.findById(req.params.article_id, (function(err, article) {
    article.comments.push(newComment._id);
    article.save(function(err) {
      if(err) {
        res.json(err);
        intel.error("ERROR", err);
      } else {
        res.json(article);
        intel.info('Updated comment ', article);
      }
    });
  }));

  newComment.save(function(err, newComment) {
    if(err) {
      res.json(err);
      intel.error("ERROR ", err);
    } else {
      res.json(newComment);
      intel.info('Added new comment ', newComment);
    }
  });
}

// *** update SINGLE comment *** //
function updateComment(req, res) {
  Comment.findById(req.params.id, function(err, comment) {
    comment.email = req.body.email;
    comment.telephone = req.body.telephone;
    comment.body = req.body.body;
    comment.confirmation = req.body.confirmation;
    comment.time = req.body.time;
    comment.save(function(err) {
      if(err) {
        res.json(err);
        intel.error("ERROR", err);
      } else {
        res.json(comment);
        intel.info('Updated comment ', comment);
      }
    });
  });
}

// *** delete SINGLE article *** //
function deleteComment(req, res) {
  Comment.findByIdAndDelete(req.params.id, function(err, article) {
    if(err) {
      res.json({'ERROR': err});
    } else {
      if(err) {
          res.json({'ERROR': err});
          intel.error("ERROR ", err);
        } else {
          res.json({'REMOVED': article});
      }
    }
  });
}

module.exports = router;