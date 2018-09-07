const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const Article = require('../models/article');
const intel = require('intel');
const passport = require('passport');

// *** api routes *** //
router.get('/comments', findAllComments);
router.get('/comment/:id', findCommentById);
router.get('/comments/:confirmation', findCommentsByConfirmation);
router.post('/comment/:article_id', addComment);
router.put('/comment/:id', updateComment);
router.delete('/comment/:id', deleteComment);

// *** get ALL comments *** //
function findAllComments(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (user && user.roles && user.roles.includes('CN=NEWS_publisher')) { 
      Comment.find()
      .populate('article')
      .exec(function(err, comments) {
        if(err) {
          res.status(400);
          res.json(err);
          intel.error(err);
        } else {
          res.json(comments);
          intel.info("Get all comments ", comments);
        }
      });
    } else {
        res.status(403);
        res.send('Access denied');
    }
  })(req, res, next);
}

// *** get SINGLE comment by ID *** //
function findCommentById(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (user && user.roles && user.roles.includes('CN=NEWS_publisher')) { 
      Comment.findById(req.params.id)
      .populate('article')
      .exec(function(err, comment) {
        if(err) {
          res.status(400);
          res.json(err);
          intel.error(err);
        } else {
          res.json(comment);
          intel.info('Get single comment by id ', comment);
        }
      });
    } else {
        res.status(403);
        res.send('Access denied');
    }
  })(req, res, next);
}

// *** get All comments by confirmation *** //
function findCommentsByConfirmation(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (user && user.roles && user.roles.includes('CN=NEWS_publisher')) { 
      Comment.find({'confirmation':req.params.confirmation})
      .populate('article')
      .exec(function(err, comments) {
        if(err) {
          res.status(400);
          res.json(err);
          intel.error(err);
        } else {
          res.json(comments);
          intel.info('Get comments by confirmation ', comments);
        }
      });
    } else {
        res.status(403);
        res.send('Access denied');
    }
  })(req, res, next);
}

// *** add SINGLE comment *** //
function addComment(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (user && user.roles && user.roles.includes('CN=NEWS_publisher')) { 
      var newComment = new Comment({
        body: req.body.body,
        confirmation: req.body.confirmation,
        time: req.body.time,
        article: req.params.article_id,
        user: req.params.user_id
      });
    
      Article.findById(req.params.article_id, (function(err, article) {
        if (article.comments == null) {
          article.comments = [];
        }
        article.comments.push(newComment._id);
        article.save(function(err) {
          if(err) {
            res.status(400);
            res.json(err);
            intel.error(err);
          }
        });
      }));
    
      newComment.save(function(err, newComment) {
        if(err) {
          res.status(400);
          res.json(err);
          intel.error(err);
        } else {
          res.json(newComment);
          intel.info('Added new comment ', newComment);
        }
      });
    } else {
        res.status(403);
        res.send('Access denied');
    }
  })(req, res, next);
}

// *** update SINGLE comment *** //
function updateComment(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (user && user.roles && user.roles.includes('CN=NEWS_publisher')) { 
      Comment.findById(req.params.id, function(err, comment) {
        if (req.body.body) {
          comment.body = req.body.body;
        }
        if (req.body.confirmation != undefined) {
          comment.confirmation = req.body.confirmation;
        }
        if (req.body.time) {
          comment.time = req.body.time;
        }
        comment.save(function(err) {
          if(err) {
            res.status(400);
            res.json(err);
            intel.error(err);
          } else {
            res.json(comment);
            intel.info('Updated comment ', comment);
          }
        });
      });
    } else {
        res.status(403);
        res.send('Access denied');
    }
  })(req, res, next);
}

// *** delete SINGLE comment *** //
function deleteComment(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (user && user.roles && user.roles.includes('CN=NEWS_publisher')) { 
      Comment.findByIdAndDelete(req.params.id, function(err, comment) {
        if(err) {
          res.status(400);
          res.json(err);
          intel.error(err);
        } else {
            res.json(comment);
            intel.info('Deleted comment ', comment);
          }
      });
    } else {
        res.status(403);
        res.send('Access denied');
    }
  })(req, res, next);
}

module.exports = router;