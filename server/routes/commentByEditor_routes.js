const express = require('express');
const router = express.Router();
const CommentByEditor = require('../models/commentByEditor');
const Article = require('../models/article');
const intel = require('intel');
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
			CommentByEditor.find()
				.populate('article')
				.exec(function(err, commentsByEditor) { 
					if(err) {
						res.status(400);
						res.json(err);
						intel.error(err);
					} else {
						res.json(commentsByEditor);
						intel.info('Get all commentsByEditor ', commentsByEditor);
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
						intel.error(err);
					} else {
						res.json(commentByEditor);
						intel.info('Get single commentByEditor by id ', commentByEditor);
					}
				});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

// *** get All commentsByEditor by confirmation *** //
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
						intel.error(err);
					} else {
						res.json(commentsByEditor);
						intel.info('Get commentsByEditor by confirmation ', commentsByEditor);
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
						intel.error(err);
					}
				});
			}));
    
			newCommentByEditor.save(function(err, newCommentByEditor) {
				if(err) {
					res.status(400);
					res.json(err);
					intel.error(err);
				} else {
					res.json(newCommentByEditor);
					intel.info('Added new commentByEditor ', newCommentByEditor);
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
						intel.error(err);
					} else {
						res.json(commentByEditor);
						intel.info('Updated commentByEditor ', commentByEditor);
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
			CommentByEditor.findByIdAndDelete(req.params.id, function(err, commentByEditor) {
				if(err) {
					res.status(400);
					res.json(err);
					intel.error(err);;
				} else {
					res.json(commentByEditor);
					intel.info('Deleted commentByEditor ', commentByEditor);
				}
			});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

module.exports = router;