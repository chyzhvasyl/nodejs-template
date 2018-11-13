const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const Article = require('../models/article');
const passport = require('passport');
const logger = require('../config/logger');
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
				.populate('user')
				.exec(function(err, comments) {
					if(err) {
						res.status(400);
						res.json(err);
						logger.error(err);
					} else {
						res.json(comments);
						logger.info(`Get all comments ${comments.length}`);
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
						logger.error(err);
					} else {
						res.json(comment);
						logger.info(`Get single comment by id ${comment._id}`);
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
						logger.error(err);
					} else {
						res.json(comments);
						logger.info(`Get comments by confirmation ${comments.length}`);
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
			Article.find({'user':user.id}).populate({
				path: 'comments',
				populate: { path: 'user' },
			}).exec(function(err, articles) {
				if(err) {
					res.status(400);
					res.json(err);
					logger.error(err);
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
					logger.info(`Get all comments by author ${user.login}`);
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
						logger.error(err);
					}
				});
			}));
    
			newComment.save(function(err, newComment) {
				if(err) {
					res.status(400);
					res.json(err);
					logger.error(err);
				} else {
					res.json(newComment);
					logger.info(`Added new comment ${newComment.body}`);
				}
			});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

// *** update SINGLE comment *** //
//TODO: findByIdAndUpdate
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
						logger.error(err);
					} else {
						res.json(comment);
						logger.info(`Added new comment ${comment.body}`);
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
			Comment.findByIdAndDelete(req.params.id, function(err, deletedComment) {
				if(err) {
					res.status(400);
					res.json(err);
					logger.error(err);
				} else {
					res.json(deletedComment);
					logger.info(`Deleted comment ${deletedComment.body}`);
				}
			});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

module.exports = router;