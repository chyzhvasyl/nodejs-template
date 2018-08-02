const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const Article = require('../models/article');
const intel = require('intel');

// *** api routes *** //
router.get('/comments', findAllComments);
router.get('/comment/:id', findCommentById);
// router.get('/comment/:confirmation', findCommentByConfirmation);
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
      intel.error(err);
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
      intel.error(err);
    } else {
      res.json(comment);
      intel.info('Get single comment by id ', comment);
    }
  });
}

// *** add SINGLE comment *** //
function addComment(req, res) {
  var newComment = new Comment({
    emailOrTelephone: req.body.emailOrTelephone,
    body: req.body.body,
    confirmation: req.body.confirmation,
    time: req.body.time,
    article: req.params.article_id
  });

  Article.findById(req.params.article_id, (function(err, article) {
    if (article.comments == null) {
      article.comments = [];
    }
    article.comments.push(newComment._id);
    article.save(function(err) {
      if(err) {
        res.json(err);
        intel.error(err);
      }
    });
  }));

  newComment.save(function(err, newComment) {
    if(err) {
      res.json(err);
      intel.error(err);
    } else {
      res.json(newComment);
      intel.info('Added new comment ', newComment);
    }
  });
}

// *** update SINGLE comment *** //
function updateComment(req, res) {
  Comment.findById(req.params.id, function(err, comment) {
    if (req.body.emailOrTelephone) {
      comment.emailOrTelephone = req.body.emailOrTelephone;
    }
    if (req.body.body) {
      comment.body = req.body.body;
    }
    if (req.body.confirmation) {
      comment.confirmation = req.body.confirmation;
    }
    if (req.body.time) {
      comment.time = req.body.time;
    }
    comment.save(function(err) {
      if(err) {
        res.json(err);
        intel.error(err);
      } else {
        res.json(comment);
        intel.info('Updated comment ', comment);
      }
    });
  });
}

// *** delete SINGLE comment *** //
function deleteComment(req, res) {
  Comment.findByIdAndDelete(req.params.id, function(err, comment) {
    if(err) {
      res.json(err);
    } else {
        res.json(comment);
        intel.info('Deleted comment ', comment);
      }
  });
}

module.exports = router;