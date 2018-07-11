const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const Article = require('../models/article');
const intel = require('intel');

// *** api routes *** //
router.get('/comments', findAllComments);
router.get('/comment/:id', findCommentById);
router.post('/comments', addComment);
// router.put('/article/:id', updateArticle);
// router.delete('/article/:id', deleteArticle);

// *** get ALL articles *** //
function findAllComments(req, res) {
  Comment.find(function(err, comments) {
    if(err) {
      res.json({'ERROR': err});
      intel.error("ERROR ", err);
    } else {
      res.json(comments);
      intel.info("Take all comments ", comments);
    }
  });
}

// *** get SINGLE article *** //
function findCommentById(req, res) {
  Comment.findById(req.params.id)
  .populate('article')
  .exec(function(err, comment) {
    if(err) {
      res.json({'ERROR': err});
      intel.error("ERROR ", err);
    } else {
      console.log(comment.article.title);
      res.json(comment);
      intel.info('Get single comment ', comment);
    }
  });
}

// *** post ALL articles *** //
function addComment(req, res) {
  var newComment = new Comment({
    email: req.body.email,
    // body: req.body.body,
    // photoUrl: req.body.photoUrl,
    // timeOfCreation: req.body.timeOfCreation,
    // timeOfPublication: req.body.timeOfPublication,
    // category: req.body.category,
    // confirmation: req.body.confirmation,
    // status: req.body.status,
    // comments: req.body.comments
  });

  newComment.save(function(err, newComment) {
    if(err) {
      res.json({'ERROR': err});
      intel.error("ERROR ", err);
    } else {
      res.json({'SUCCESS': newComment});
      intel.info('Added new comment ', newComment);
    }
  });
}

// // *** put SINGLE article *** //
// function updateArticle(req, res) {
//   Article.findById(req.params.id, function(err, article) {
//     article.title = req.body.title;
//     article.body = req.body.body;
//     article.photoUrl = req.body.photoUrl;
//     article.timeOfCreation = req.body.timeOfCreation;
//     article.timeOfPublication = req.body.timeOfPublication;
//     article.category = req.body.category;
//     article.confirmation = req.body.confirmation;
//     article.status = req.body.status;
//     article.comments = req.body.comments;
//     article.save(function(err) {
//       if(err) {
//         res.json({'ERROR': err});
//         intel.error("ERROR ", err);
//       } else {
//         res.json({'UPDATED': article});
//         intel.info('Updated article ', article);
//       }
//     });
//   });
// }

// // *** delete SINGLE article *** //
// function deleteArticle(req, res) {
//   Article.findById(req.params.id, function(err, article) {
//     if(err) {
//       res.json({'ERROR': err});
//     } else {
//       article.remove(function(err){
//         if(err) {
//           res.json({'ERROR': err});
//           intel.error("ERROR ", err);
//         } else {
//           res.json({'REMOVED': article});
//           intel.info('Deleted article ', article);
//         }
//       });
//     }
//   });
// }

module.exports = router;