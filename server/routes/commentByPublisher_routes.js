const express = require('express');
const router = express.Router();
const CommentByPublisher = require('../models/commentByPublisher');
const Article = require('../models/article');
const intel = require('intel');
const passport = require('passport');

// *** api routes *** //
router.get('/commentsByPublisher', findAllCommentsByPublisher);
router.get('/commentByPublisher/:id', findCommentByPublisherById);
router.get('/commentsByPublisher/:confirmation', findCommentsByPublisherByConfirmation);
router.post('/commentByPublisher/:article_id', addCommentByPublisher);
router.put('/commentByPublisher/:id', updateCommentByPublisher);
router.delete('/commentByPublisher/:id', deleteCommentByPublisher);

// *** get ALL commentsByPublisher *** //
function findAllCommentsByPublisher(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (user && user.roles && user.roles.includes('CN=NEWS_publisher')) { 
      CommentByPublisher.find()
      .populate('article')
      .exec(function(err, commentsByPublisher) {
        if(err) {
          res.status(400);
          res.json(err);
          intel.error(err);
        } else {
          res.json(commentsByPublisher);
          intel.info("Get all commentsByPublisher ", commentsByPublisher);
        }
      });
    } else {
        res.status(403);
        res.send('Access denied');
    }
  })(req, res, next);
}

// *** get SINGLE commentByPublisher by ID *** //
function findCommentByPublisherById(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (user && user.roles && user.roles.includes('CN=NEWS_publisher')) { 
      CommentByPublisher.findById(req.params.id)
      .populate('article')
      .exec(function(err, commentByPublisher) {
        if(err) {
          res.status(400);
          res.json(err);
          intel.error(err);
        } else {
          res.json(commentByPublisher);
          intel.info('Get single commentByPublisher by id ', commentByPublisher);
        }
      });
    } else {
        res.status(403);
        res.send('Access denied');
    }
  })(req, res, next);
}

// *** get All commentsByPublisher by confirmation *** //
function findCommentsByPublisherByConfirmation(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (user && user.roles && user.roles.includes('CN=NEWS_publisher')) { 
      CommentByPublisher.find({'confirmation':req.params.confirmation})
      .populate('article')
      .exec(function(err, commentsByPublisher) {
        if(err) {
          res.status(400);
          res.json(err);
          intel.error(err);
        } else {
          res.json(commentsByPublisher);
          intel.info('Get commentsByPublisher by confirmation ', commentsByPublisher);
        }
      });
    } else {
        res.status(403);
        res.send('Access denied');
    }
  })(req, res, next);
}

// *** add SINGLE commentByPublisher *** //
function addCommentByPublisher(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (user && user.roles && user.roles.includes('CN=NEWS_publisher')) { 
      var newCommentByPublisher = new CommentByPublisher({
        body: req.body.body,
        confirmation: req.body.confirmation,
        time: req.body.time,
        article: req.params.article_id,
        user: req.params.user_id
      });
    
      Article.findById(req.params.article_id, (function(err, article) {
        if (article.commentsByPublisher == null) {
          article.commentsByPublisher = [];
        }
        article.commentsByPublisher.push(newCommentByPublisher._id);
        article.save(function(err) {
          if(err) {
            res.status(400);
            res.json(err);
            intel.error(err);
          }
        });
      }));
    
      newCommentByPublisher.save(function(err, newCommentByPublisher) {
        if(err) {
          res.status(400);
          res.json(err);
          intel.error(err);
        } else {
          res.json(newCommentByPublisher);
          intel.info('Added new commentByPublisher ', newCommentByPublisher);
        }
      });
    } else {
        res.status(403);
        res.send('Access denied');
    }
  })(req, res, next);
}

// *** update SINGLE commentByPublisher *** //
function updateCommentByPublisher(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (user && user.roles && user.roles.includes('CN=NEWS_publisher')) { 
      CommentByPublisher.findById(req.params.id, function(err, ccommentByPublisher) {
        if (req.body.body) {
          commentByPublisher.body = req.body.body;
        }
        if (req.body.confirmation != undefined) {
          commentByPublisher.confirmation = req.body.confirmation;
        }
        if (req.body.time) {
          commentByPublisher.time = req.body.time;
        }
        commentByPublisher.save(function(err) {
          if(err) {
            res.status(400);
            res.json(err);
            intel.error(err);
          } else {
            res.json(commentByPublisher);
            intel.info('Updated commentByPublisher ', commentByPublisher);
          }
        });
      });
    } else {
        res.status(403);
        res.send('Access denied');
    }
  })(req, res, next);
}

// *** delete SINGLE commentByPublisher *** //
function deleteCommentByPublisher(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (user && user.roles && user.roles.includes('CN=NEWS_publisher')) { 
      CommentByPublisher.findByIdAndDelete(req.params.id, function(err, commentByPublisher) {
        if(err) {
          res.status(400);
          res.json(err);
          intel.error(err);
        } else {
            res.json(commentByPublisher);
            intel.info('Deleted commentByPublisher ', commentByPublisher);
          }
      });
    } else {
        res.status(403);
        res.send('Access denied');
    }
  })(req, res, next);
}

module.exports = router;