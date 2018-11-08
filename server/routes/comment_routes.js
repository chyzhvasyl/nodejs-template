const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const Article = require('../models/article');
// const intel = require('intel');
const passport = require('passport');
const util = require('../util');
const general = require('../config/general'); 

// *** api routes *** //
router.get('/comments/:flag', findAllComments);
router.get('/comment/:id', findCommentById);
router.get('/comments/:confirmation/:flag', findCommentsByConfirmation);
router.get('/comments_by_auth/:flag', findAllCommentsOnAllUsersArticles);
router.post('/comment/:article_id/:user_id', addComment);
router.put('/comment/:id', updateComment);
router.delete('/comment/:id', deleteComment); 

// *** get ALL comments *** //
function findAllComments(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Reader', 'CN=NEWS_Author', 'CN=NEWS_publisher', 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
			Comment.find().sort({ time : -1 }).skip(req.params.flag * general.dataChunk).limit(general.dataChunk)
				.populate('article')
				.exec(function(err, comments) {
					if(err) {
						res.status(400);
						res.json(err);
						// intel.error(err);
					} else {
						res.json(comments);
						// intel.info('Get all comments ', comments);
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
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Reader', 'CN=NEWS_Author', 'CN=NEWS_publisher', 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
			Comment.findById(req.params.id)
				.populate('article')
				.exec(function(err, comment) {
					if(err) {
						res.status(400);
						res.json(err);
						// intel.error(err);
					} else {
						res.json(comment);
						// intel.info('Get single comment by id ', comment);
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
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Reader', 'CN=NEWS_Author', 'CN=NEWS_publisher', 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
			Comment.find({'confirmation':req.params.confirmation}).sort({ time : -1 }).skip(req.params.flag * general.dataChunk).limit(general.dataChunk)
				.populate('article')
				.exec(function(err, comments) {
					if(err) {
						res.status(400);
						res.json(err);
						// intel.error(err);
					} else {
						res.json(comments);
						// intel.info('Get comments by confirmation ', comments);
					}
				});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

function findAllCommentsOnAllUsersArticles(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Author')) {
			Article.find({'user':user.id}).populate('comments').exec(function(err, articles) {
				if(err) {
					res.status(400);
					res.json(err);
					// intel.error(err);
				} else {
					let comments = [];
					Array.from(articles).forEach(article => {
						article.comments.forEach(comment => {
							comments.push(comment);
						});
					});
					comments.sort(function(a, b){
						a = new Date(a.time);
						b = new Date(b.time);
						return a>b ? -1 : a<b ? 1 : 0;
					});
					let a = req.params.flag * general.dataChunk;
					let b = req.params.flag * general.dataChunk + general.dataChunk;
					res.json(comments.slice(a, b));
					// intel.info('Get all comments by author ', user.id);
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
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Reader', 'CN=NEWS_Author', 'CN=NEWS_publisher', 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
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
						// intel.error(err);
					}
				});
			}));
    
			newComment.save(function(err, newComment) {
				if(err) {
					res.status(400);
					res.json(err);
					// intel.error(err);
				} else {
					res.json(newComment);
					// intel.info('Added new comment ', newComment);
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
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Reader', 'CN=NEWS_Author', 'CN=NEWS_publisher', 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
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
						// intel.error(err);
					} else {
						res.json(comment);
						// intel.info('Updated comment ', comment);
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
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user,'CN=NEWS_Author', 'CN=NEWS_publisher', 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
			Comment.findByIdAndDelete(req.params.id, function(err, comment) {
				if(err) {
					res.status(400);
					res.json(err);
					// intel.error(err);
				} else {
					res.json(comment);
					// intel.info('Deleted comment ', comment);
				}
			});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

module.exports = router;