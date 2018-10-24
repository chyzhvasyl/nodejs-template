const express = require('express');
const router = express.Router();
const File = require('../models/file');
const fs = require('fs');
const path = require('path');
const UPLOAD_PATH = './server/uploads';
const passport = require('passport');
const util = require('../util');
// const intel = require('intel');

// *** api routes *** //
router.get('/files', findAllFiles);
router.get('/file/:id', findFileById);
router.get('/file-small/:id', findFileSmallById);
router.get('/video/:id/:format', findVideoById);
router.get('/screenshot/:id', findScreenshotById);

// *** get ALL files *** //
function findAllFiles(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Reader', 'CN=NEWS_Author', 'CN=NEWS_publisher', 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
			File.find(function(err, files) {
				if (err) {
					res.sendStatus(400);
					res.json(err);
					// intel.error(err);
				}
				res.json(files);
				// intel.info('Get all files ', files);
			});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

// *** get single file by ID *** //
function findFileById(req, res, next) {	
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Reader', 'CN=NEWS_Author', 'CN=NEWS_publisher', 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
			File.findById(req.params.id, (err, file) => {
				if (err) {
					res.sendStatus(400);
					res.json(err);
					// intel.error(err);
				}
				res.setHeader('Content-Type', file.contentType);
				fs.createReadStream(path.join(UPLOAD_PATH + '/images/', file.filename)).pipe(res);
			});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

// *** get single file-small by ID *** //
function findFileSmallById(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Reader', 'CN=NEWS_Author', 'CN=NEWS_publisher', 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
			File.findById(req.params.id, (err, file) => {
				if (err) {
					res.sendStatus(400);
					res.json(err);
					// intel.error(err);
				}
				res.setHeader('Content-Type', file.contentType); 
				fs.createReadStream(path.join(UPLOAD_PATH + '/images/', 'small-' + file.filename)).pipe(res);
			});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

// *** get single video by ID *** //
function findVideoById(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Reader', 'CN=NEWS_Author', 'CN=NEWS_publisher', 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
			File.findById(req.params.id, (err, file) => {
				if (err) {
					res.sendStatus(400);
					res.json(err);
					// intel.error(err);
				}
				const videoPath = path.join(UPLOAD_PATH + '/videos/', 'convert_' + file.filename);
				const stat = fs.statSync(videoPath);
				const fileSize = stat.size;
				const range = 'bytes=0-';
				const parts = range.replace(/bytes=/, '').split('-');
				const start = parseInt(parts[0], 10);
				const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
				const chunksize = (end-start)+1;
				const videoFile = fs.createReadStream(videoPath, {start, end});
				if (req.params.format === 'ogv') {
					res.setHeader('Content-Type', 'video/ogg');
				} else if (req.params.format === 'mp4') {
					res.setHeader('Content-Type', 'video/mp4');
				} else if (req.params.format === 'webm') {
					res.setHeader('Content-Type', 'video/webm');
				}
				res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
				res.setHeader('Accept-Ranges', 'bytes');
				res.setHeader('Content-Length', chunksize);
				videoFile.pipe(res);
			});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

// *** get single screenshot by ID *** //
function findScreenshotById(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Reader', 'CN=NEWS_Author', 'CN=NEWS_publisher', 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
			File.findById(req.params.id, (err, file) => {
				if (err) {
					res.sendStatus(400);
					res.json(err);
					// intel.error(err);
				}
				res.setHeader('Content-Type', 'image/png');
				fs.createReadStream(path.join(UPLOAD_PATH + '/videos/', 'screenshot_' + file.filename.substring(0, file.filename.lastIndexOf('.')) + '.png')).pipe(res);
			});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

module.exports = router;