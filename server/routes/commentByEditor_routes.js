const express = require('express');
const router = express.Router();
const CommentByEditor = require('../models/commentByEditor');
const Article = require('../models/article');
const logger = require('../config/logger');
const passport = require('passport');

// *** api routes *** //
router.get('/commentsByEditor', findAllCommentsByEditor);
router.get('/commentByEditor/:id', findCommentByEditorById);
router.get('/commentsByEditor/:confirmation', findCommentsByEditorByConfirmation);
router.post('/commentByEditor/:article_id/:user_id', addCommentByEditor);
router.put('/commentByEditor/:id', updateCommentByEditor);
router.delete('/commentByEditor/:id', deleteCommentByEditor);

// *** get ALL comments *** //
function findAllCommentsByEditor(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (user && user.roles && user.roles.includes('CN=NEWS_Editor')) {
			CommentByEditor.find().sort({ time : -1 })
				.populate('article')
				.exec(function(err, commentsByEditor) { 
					if(err) {
						res.status(400);
						res.json(err);
						logger.error(err);
					} else {
						res.json(commentsByEditor);
						logger.info(`Get all commentsByEditor ${commentsByEditor.length}`);
					}
				});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

// *** get SINGLE comment by ID *** //
function findCommentByEditorById(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (user && user.roles && user.roles.includes('CN=NEWS_Editor')) {
			CommentByEditor.findById(req.params.id)
				.populate('article')
				.exec(function(err, commentByEditor) {
					if(err) {
						res.status(400);
						res.json(err);
						logger.error(err);
					} else {
						res.json(commentByEditor);
						logger.info(`Get single commentByEditor by id ${commentByEditor._id}`);
					}
				});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

// *** get All commentsByEditor by confirmation *** //
//TODO: Нужно или нет
function findCommentsByEditorByConfirmation(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (user && user.roles && user.roles.includes('CN=NEWS_Editor')) {
			CommentByEditor.find({'confirmation':req.params.confirmation})
				.populate('article')
				.exec(function(err, commentsByEditor) {
					if(err) {
						res.status(400);
						res.json(err);
						logger.error(err);
					} else {
						res.json(commentsByEditor);
						logger.info(`Get commentsByEditor by confirmation ${commentsByEditor._id}`);
					}
				});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

// *** add SINGLE commentByEditor *** //
function addCommentByEditor(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (user && user.roles && user.roles.includes('CN=NEWS_Editor')) {
			var newCommentByEditor = new CommentByEditor({
				body: req.body.body,
				confirmation: req.body.confirmation,
				time: req.body.time,
				article: req.params.article_id,
				user: req.params.user_id
			});
    
			Article.findById(req.params.article_id, (function(err, article) {
				if (article.commentsByEditor== null) {
					article.commentsByEditor = [];
				}
				article.commentsByEditor.push(newCommentByEditor._id);
				article.save(function(err) {
					if(err) {
						res.status(400);
						res.json(err);
						logger.error(err);
					}
				});
			}));
    
			newCommentByEditor.save(function(err, newCommentByEditor) {
				if(err) {
					res.status(400);
					res.json(err);
					logger.error(err);
				} else {
					res.json(newCommentByEditor);
					logger.info(`Added new commentByEditor ${newCommentByEditor.body}`);
				}
			});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

// *** update SINGLE commentByEditor *** //
function updateCommentByEditor(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (user && user.roles && user.roles.includes('CN=NEWS_Editor')) {
			CommentByEditor.findById(req.params.id, function(err, commentByEditor) {
				if (req.body.body) {
					commentByEditor.body = req.body.body;
				}
				if (req.body.confirmation != undefined) {
					commentByEditor.confirmation = req.body.confirmation;
				}
				if (req.body.time) {
					commentByEditor.time = req.body.time;
				}
				commentByEditor.save(function(err) {
					if(err) {
						res.status(400);
						res.json(err);
						logger.error(err);
					} else {
						res.json(commentByEditor);
						logger.info(`Updated commentByEditor ${commentByEditor.body}`);
					}
				});
			});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

// *** delete SINGLE commentByEditor *** //
function deleteCommentByEditor(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (user && user.roles && user.roles.includes('CN=NEWS_Editor')) {
			CommentByEditor.findByIdAndDelete(req.params.id, function(err, deletedCommentByEditor) {
				if(err) {
					res.status(400);
					res.json(err);
					logger.error(err);
				} else {
					res.json(deletedCommentByEditor);
					logger.info(`Deleted commentByEditor ${deletedCommentByEditor.body}`);
				}
			});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

module.exports = router;