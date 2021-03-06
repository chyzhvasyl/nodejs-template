const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const mime = require('mime');
const Article = require('../models/article');
const Comment = require('../models/comment');
const CommentByEditor = require('../models/commentByEditor');
const CommentByPublisher = require('../models/commentByPublisher');
const File = require('../models/file');
const User = require('../models/user');
const UPLOAD_PATH = './server/uploads';
const UPLOAD_PATH_IMAGES = UPLOAD_PATH + '/images';
const UPLOAD_PATH_VIDEOS = UPLOAD_PATH + '/videos';
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
const passport = require('passport');
const util = require('../util');
const general = require('../config/general'); 
const logger = require('../config/logger');
//--------TODO:Delete or use-----------//

// *** api routes *** //
router.get('/articles/:flag', findAllArticles);
router.get('/article/:id/:confirmation', findArticleByIdAndConfirmation);
router.get('/articles/category/:category_id/:confirmation/:flag', findAllArticlesByCategoryAndConfirmation);
router.get('/articles/user/:user_id/:flag', findAllArticlesByUserId);
router.get('/articles/confirmation/:confirmation/:flag', findAllArticlesByConfirmation);
router.get('/articles/status_created/:flag', findAllArticlesStatusCreated);
router.get('/articles/status_modified/:flag', findAllArticlesStatusModified);
router.post('/article/:category_id/:template_id?/:user_id?', addArticle);
router.put('/article/like/:id', likeArticle);
router.put('/article/:id/:category_id?', updateArticle);
router.delete('/article/:id', deleteArticle);
// don't change the order of the methods

// *** get ALL articles *** //
function findAllArticles(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Reader', 'CN=NEWS_Author', 'CN=NEWS_publisher', 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
			Article.find({}, { title: true, shortBody: true, status: true, confirmation: true, user: true, file: true, timeOfCreation: true, timeOfPublication: true, body:true}).sort({ timeOfCreation : -1 }).skip(req.params.flag * general.dataChunk).limit(general.dataChunk)
				.populate('category')
				.populate('file')
				.populate('template')
				.populate('user')
				.lean()
				.exec(function(err, articles) {
					if(err) {
						res.status(400);
						res.json(err);
						logger.error(err);
					} else {
						articles = articles.map(a => addFileUrl(a, a.file, req, user));
						res.json(articles);
						logger.info(`Get all articles ${articles.length}`);
					}
				});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

// *** get SINGLE article by id *** //
function findArticleByIdAndConfirmation(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Reader', 'CN=NEWS_Author', 'CN=NEWS_publisher', 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
			Article.findOne({'_id' : req.params.id, 'confirmation' : req.params.confirmation})
				.populate({
					path: 'comments',
					match: { confirmation: true},
					populate: { path: 'user' },
					options: { sort: { time : -1 }}
				})
				.populate({
					path: 'commentsByEditor',
					populate: { path: 'user' },
					options: { sort: { time : -1 }}
				})
				.populate({
					path: 'commentsByPublisher',
					populate: { path: 'user' },
					options: { sort: { time : -1 }}
				})
				.populate('user')
				.populate('category')
				.populate('file')
				.populate('template')
				.lean()
				.exec(function(err, article) {
					if(err) {
						res.status(400);
						res.json(err);
						logger.error(err);
					} else {
						article = addFileUrl(article, article.file, req, user);
						res.json(article);
						logger.info(`Get single article by id ${article._id}`);
					}
				});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

// *** get All articles by category *** //
function findAllArticlesByCategoryAndConfirmation(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Reader', 'CN=NEWS_Author', 'CN=NEWS_publisher', 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
			Article.find({'category':req.params.category_id, 'confirmation' : req.params.confirmation}, { title: true, shortBody: true, status: true, confirmation: true, user: true, file: true, timeOfCreation: true, timeOfPublication: true}).sort({ timeOfPublication : -1 }).skip(req.params.flag * general.dataChunk).limit(general.dataChunk)
				.populate('category')
				.populate('file')
				.populate('template')
				.populate('user')
				.lean()
				.exec(function(err, articles){
					if(err) {
						res.status(400);
						res.json(err);
						logger.error(err);
					} else {
						articles = articles.map(a => addFileUrl(a, a.file, req, user));
						res.json(articles);
						logger.info(`Get all articles by category ${req.params.category} ${articles.length}`);
					}
				});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

// *** get All articles by confirmation *** //
function findAllArticlesByConfirmation(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Reader', 'CN=NEWS_Author', 'CN=NEWS_publisher', 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
			Article.find({'confirmation':req.params.confirmation}, { title: true, shortBody: true, status: true, confirmation: true, user: true, file: true, timeOfCreation: true, timeOfPublication: true , body: true}).sort({ timeOfPublication : -1 }).skip(req.params.flag * general.dataChunk).limit(general.dataChunk)
				.populate('category')
				.populate('file')
				.populate('template')
				.populate('user')
				.lean()
				.exec(function(err, articles){
					if(err) {
						res.status(400);
						res.json(err);
						logger.error(err);
					} else {
						articles = articles.map(a => addFileUrl(a, a.file, req, user));
						res.json(articles);
						logger.info(`Get all articles by confirmation ${req.params.confirmation} ${articles.length}`);
					}
				});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

// *** get All articles by user Id *** //
function findAllArticlesByUserId(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Author')) {
			Article.find({'user':req.params.user_id}, { title: true, shortBody: true, status: true, confirmation: true, user: true, file: true, timeOfCreation: true, timeOfPublication: true, body: true }).sort({ timeOfCreation : -1 }).skip(req.params.flag * general.dataChunk).limit(general.dataChunk)
				.populate('category')
				.populate('file')
				.populate('template')
				.populate('user')
				.lean()
				.exec(function(err, articles){
					if(err) {
						res.status(400);
						res.json(err);
						logger.error(err);
					} else {
						articles = articles.map(a => addFileUrl(a, a.file, req, user));
						res.json(articles);
						logger.info(`Get all articles by user id ${req.params.user_id} ${articles.length}`);
					}
				});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

// *** get All articles by several status *** //
// TODO: refactoring
function findAllArticlesStatusCreated(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Editor')) {
			Article.find({ $or: [{status : 'not approved by publisher'}, {status : 'created'}]}).sort({ timeOfCreation : -1 }).skip(req.params.flag * general.dataChunk).limit(general.dataChunk)
				.populate('category')
				.populate('file')
				.populate('template')
				.populate('user')
				.lean()
				.exec(function(err, articles){
					if(err) {
						res.status(400);
						res.json(err);
						logger.error(err);
					} else {
						articles = articles.map(a => addFileUrl(a, a.file, req, user));
						res.json(articles);
						logger.info(`Get all articles by several status: not approved by publisher, created ${articles.length}`);
					}
				});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

function findAllArticlesStatusModified(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_publisher')){
			Article.find({ $or: [{status : 'modified'}]}).sort({ timeOfCreation : -1 }).skip(req.params.flag * general.dataChunk).limit(general.dataChunk)
				.populate({
					path: 'comments',
					populate: { path: 'user' }
				})
				.populate({
					path: 'commentsByEditor',
					populate: { path: 'user' }
				})
				.populate({
					path: 'commentsByPublisher',
					populate: { path: 'user' }
				})
				.populate('category')
				.populate('file')
				.populate('template')
				.populate('user')
				.lean()
				.exec(function(err, articles){
					if(err) {
						res.status(400);
						res.json(err);
						logger.error(err);
					} else {
						articles = articles.map(a => addFileUrl(a, a.file, req, user));
						res.json(articles);
						logger.info(`Get all articles by several status: not approved by publisher, created ${articles.length}`);
					}
				});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

// *** add SINGLE article  *** //
function addArticle(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Author', 'CN=NEWS_Administrator')) {
			if (req.headers['content-type'].indexOf('multipart/form-data') !== -1) {
				upload(req, res, function (err) {
					if (err) {
						res.send(err);
						return;
					} else {
						if (req.file) { 
							const newFile = new File();
							// newFile.filename = req.file.filename.substring(0, req.file.filename.lastIndexOf('.'));
							newFile.filename = req.file.filename;
							newFile.contentType = req.file.mimetype;
							newFile.save(function (err, newFile) {
								if (err) {
									res.sendStatus(400);
									res.json(err);
									logger.error(err);
								}
								const newArticle = new Article();
								newArticle.title = req.body.title;
								newArticle.shortBody = req.body.shortBody;
								newArticle.body = req.body.body;
								newArticle.confirmation = req.body.confirmation;
								newArticle.status = req.body.status;
								newArticle.file = newFile._id;
								newArticle.category = req.params.category_id;
								newArticle.template = req.params.template_id;
								newArticle.user = req.params.user_id;
								notifyUsers(req.io.sockets.clients(), req.io.sockets.connected, newArticle, 'CN=NEWS_Editor', 'У Вас появилась новость требующая проверки', 'update', req);
								newArticle.save(saveCallback(req, res, newFile, user));
							});
						}
					}
				});
			} 
			if (req.headers['content-type'].indexOf('application/json') !== -1) {
				if (req.body.fileBase64 && req.body.fileBase64Small) {
					const currentDate = Date.now();
					const fileMeta = saveFile(req.body.fileBase64, 'img', currentDate, res);
					const smallFileMeta = saveFile(req.body.fileBase64Small, 'small-img', currentDate, res);
					const newFile = new File();
					newFile.filename = fileMeta.fileName;
					newFile.contentType = mime.getType(fileMeta.extension);
					newFile.save(function (err, newFile) {
						if (err) {
							res.sendStatus(400);
							res.json(err);
							logger.error(err);
						}

						const newArticle = new Article();
						newArticle.title = req.body.title;
						newArticle.shortBody = req.body.shortBody;
						newArticle.body = req.body.body;
						newArticle.confirmation = req.body.confirmation;
						newArticle.status = req.body.status;
						newArticle.file = newFile._id;
						newArticle.category = req.params.category_id;
						newArticle.template = req.params.template_id;
						newArticle.user = req.params.user_id;
						notifyUsers(req.io.sockets.clients(), req.io.sockets.connected, newArticle, 'CN=NEWS_Editor', 'У Вас появилась новость требующая проверки', 'update', req);
						newArticle.save(saveCallback(req, res, newFile, user));
					});
				}   
			} 
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

function saveFile(file, prefix, currentDate, res) {
	if (file) {
		const decodedImg = decodeBase64Image(file);
		const imageBuffer = decodedImg.data;
		const type = decodedImg.type;
		const extension = mime.getExtension(type);
		const fileName = `${prefix}-${currentDate}.${extension}`;
		try {
			fs.writeFileSync(UPLOAD_PATH_IMAGES + '/' + fileName, imageBuffer, 'utf8');
			return {
				fileName: fileName,
				extension: extension
			};
		} catch (err) {
			//TODO:Refactoring
			res.error(err);
			res.status(400);
			res.json(err);
		}
	}
	return {};
}   

function saveCallback(req, res, file, user) {
	return function (err, article) {
		if (err) {
			res.status(400);
			res.json(err);
			logger.error(err);
		} else {
			if (file.contentType.indexOf('video') != -1) {
				convert(UPLOAD_PATH_VIDEOS + '/' + file.filename, file.filename, req, function(err){
					//TODO: refactoring
					if(!err) {
						console.log('conversion complete');
					}
				});
				getScreenshot(UPLOAD_PATH_VIDEOS + '/' + file.filename, file.filename, UPLOAD_PATH_VIDEOS, function(err){
					if(!err) {
						console.log('conversion complete');
					}
				});
				let articleResponse = addFileUrl(article.toJSONObject(), file, req, user);
				res.status(201);
				res.json(articleResponse);
				logger.info(`Added new article ${articleResponse.title}`);
			} else {
				let articleResponse = addFileUrl(article.toJSONObject(), file, req, user);
				res.status(201);
				res.json(articleResponse);
				logger.info(`Added new article ${articleResponse.title}`);
			}
		}
	};
}

function addFileUrl(article, file, req, user) {
	if (article && file && file._id) {
		// const videoFiletypes = /video\/pm4|video\/webm|video\/ogg|video\/x-matroska/;
		const imageFileTypes =  /image/;
		const videoFileTypes = /video/;
		const isImage = imageFileTypes.test(file.contentType);
		const isVideo = videoFileTypes.test(file.contentType);
		if (isImage) {
			article['imgUrl'] = req.protocol + '://' + req.get('host') + '/file/' + file._id + '?username='+ user.login +'&password=' + user.token;
			article['imgSmallUrl'] = req.protocol + '://' + req.get('host') + '/file-small/' + file._id + '?username='+ user.login +'&password=' + user.token;
		}
		if (isVideo) {
			article['videoOgvUrl'] = req.protocol + '://' + req.get('host') + '/video/' + file._id + '/ogv' + '?username='+ user.login +'&password=' + user.token;
			article['videoMP4Url'] = req.protocol + '://' + req.get('host') + '/video/' + file._id + '/mp4' + '?username='+ user.login +'&password=' + user.token;
			article['videoWebmUrl'] = req.protocol + '://' + req.get('host') + '/video/' + file._id + '/webm' + '?username='+ user.login +'&password=' + user.token;
			article['screenshot'] = req.protocol + '://' + req.get('host') + '/screenshot/' + file._id + '?username='+ user.login +'&password=' + user.token;
		}
		return article;
	}
}

function decodeBase64Image(dataString) {
	const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
		response = {};

	if (matches.length !== 3) {
		return new Error('Invalid input string');
	}

	response.type = matches[1];
	response.data = new Buffer(matches[2], 'base64');

	return response;
}

// *** multer configuration *** //
let storage = multer.diskStorage({
	destination: UPLOAD_PATH_VIDEOS,
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});

let upload = multer({
	storage: storage,
	limits: {fileSize: 100 * 1024 * 1024},
	fileFilter: function (req, file, cb) {
		checkFileType(file, cb);
	}
}).single('video');

function checkFileType(file, cb) {
	const filetypes = /.jpeg|.jpg|.png|.gif|.mkv|.mp4/;
	const extname = path.extname(file.originalname).toLowerCase();
	const isValidExtension = filetypes.test(extname);
	if (isValidExtension) {
		return cb(null, true);
	} else {
		cb('Error: Images only!');
	}
} 

// *** convert configuration *** //
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
console.log(ffmpegInstaller.path, ffmpegInstaller.version);

function convert(input, filename, req, callback) {
	ffmpeg(input)
		.output(UPLOAD_PATH_VIDEOS + '/' + 'convert_' + filename.substring(0, filename.lastIndexOf('.')) + '.mp4').format('mp4').size('640x480')
		.output(UPLOAD_PATH_VIDEOS + '/' + 'convert_' + filename.substring(0, filename.lastIndexOf('.')) + '.ogv').format('ogv').size('640x480')
		.output(UPLOAD_PATH_VIDEOS + '/' + 'convert_' + filename.substring(0, filename.lastIndexOf('.')) + '.webm').format('webm').size('640x480')
		.on('progress', function(progress) {
			console.log('Processing: ' + progress.percent + '% done');
		})
		.on('error', function(err){
			console.log('error: ', err.code, err.msg);
			callback(err);	
		})
		.on('end', function() {                    
			console.log('Processing finished !');
			req.io.emit('video', 'Video converted');
		}).run();
}

function getScreenshot(filePath, fileName, outputFolder, callback) {
	ffmpeg(filePath)
		.on('filenames', function(filenames) {
			console.log('Will generate ' + filenames.join(', '));
			callback(null);
		})
		.on('end', function() {
			console.log('Screenshots taken');
		})
		.thumbnail({
			count: 1,
			folder: outputFolder,
			filename: 'screenshot_' + fileName.substring(0, fileName.lastIndexOf('.')) + '.png',
			size: '400x400'
		});
}

// *** update SINGLE article *** //
function updateArticle(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Author', 'CN=NEWS_publisher', 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
			if (req.headers['content-type'].indexOf('application/json') !== -1) {
				Article.findById(req.params.id)
					.populate('category')
					.populate('file')
					.populate('user')
					.exec(function(err, article) {
						if (req.body.title) {
							article.title = req.body.title;
						}
						if (req.body.shortBody) {
							article.shortBody = req.body.shortBody;
						}
						if (req.body.body) {
							article.body = req.body.body;
						}
						if (req.body.timeOfCreation) {
							article.timeOfCreation = req.body.timeOfCreation;
						}
						if (req.body.timeOfPublication) {
							article.timeOfPublication = req.body.timeOfPublication;
						}
						if (req.body.confirmation != undefined) {
							article.confirmation = req.body.confirmation;
						}
						if (req.body.status) {
						//TODO: change emit to broadcast
							if (article.status == 'created' && req.body.status == 'not approved by editor') {
								article.status = req.body.status;
								let articleResponse = addFileUrl(article.toJSONObject(), article.file, req, user);
								notifyUsers(req.io.sockets.clients(), req.io.sockets.connected, articleResponse, 'CN=NEWS_Author', 'Ваша новость не утверждена, необходимо редактирование', 'update', req);
							} else if (article.status == 'created' && req.body.status == 'modified') {
								article.status = req.body.status;
								let articleResponse = addFileUrl(article.toJSONObject(), article.file, req, user);
								notifyUsers(req.io.sockets.clients(), req.io.sockets.connected, articleResponse, 'CN=NEWS_publisher', 'У Вас появилась новость требующая проверки', 'update', req);
							} else if (article.status == 'not approved by editor' && req.body.status == 'created') {
								article.status = req.body.status;
								let articleResponse = addFileUrl(article.toJSONObject(), article.file, req, user);
								notifyUsers(req.io.sockets.clients(), req.io.sockets.connected, articleResponse, 'CN=NEWS_Editor', 'У Вас появилась новость требующая проверки', 'update', req);
							} else if (article.status == 'modified' && req.body.status == 'not approved by publisher') {
								article.status = req.body.status;
								let articleResponse = addFileUrl(article.toJSONObject(), article.file, req, user);
								notifyUsers(req.io.sockets.clients(), req.io.sockets.connected, articleResponse, 'CN=NEWS_Editor', 'Ваша новость не утверждена, необходимо редактирование', 'update', req);
							} else if (article.status == 'modified' && req.body.status == 'published') {
								article.timeOfPublication = Date.now();
								article.status = req.body.status;
								let articleResponse = addFileUrl(article.toJSONObject(), article.file, req, user);
								notifyUsers(req.io.sockets.clients(), req.io.sockets.connected, articleResponse, 'CN=NEWS_Reader', 'Опубликована новая новость', 'update', req);
							} else if (article.status === 'not approved by publisher' && req.body.status == 'modified') {
								article.status = req.body.status;
								let articleResponse = addFileUrl(article.toJSONObject(), article.file, req, user);
								notifyUsers(req.io.sockets.clients(), req.io.sockets.connected, articleResponse, 'CN=NEWS_publisher', 'У Вас появилась новость требующая проверки', 'update', req);
							} else {
								article.status = req.body.status;
							}
						}
						if (req.params.category_id) {
							article.category = req.params.category_id;
						}
						if (req.body.fileBase64 && req.body.fileBase64Small) {
							const currentDate = Date.now();
							const fileMeta = saveFile(req.body.fileBase64, 'img', currentDate, res);
							const smallFileMeta = saveFile(req.body.fileBase64Small, 'small-img', currentDate, res);
							const imageFileTypes = /image/;
							const videoFileTypes = /video/;
							const isImage = imageFileTypes.test(article.file.contentType);
							const isVideo = videoFileTypes.test(article.file.contentType);
							if (isImage) {
								File.findById(article.file._id, function(err, file) {
									file.filename = fileMeta.fileName;
									file.contentType = mime.getType(fileMeta.extension);
									file.save(function (err, file){
										if (err) {
											res.sendStatus(400);
											res.json(err);
											logger.error(err);
										} else {
											fs.unlink(UPLOAD_PATH_IMAGES + '/' + article.file.filename, (err) => {
												if (err) {
													res.json(err);
													logger.error(err);
												}
												logger.info(`${article.file.filename} was deleted`);
											});
											fs.unlink(UPLOAD_PATH_IMAGES+ '/small-' + article.file.filename, (err) => {
												if (err) {
													res.json(err);
													logger.error(err);
												}
												logger.info(`small-${article.file.filename} was deleted`);
											});
											article.save(saveCallback(req, res, file, user));
										}
									});
								});
							} else if (isVideo) {
								File.findById(article.file._id, function(err, file) {
									file.filename = fileMeta.fileName;
									file.contentType = mime.getType(fileMeta.extension);
									file.save(function (err, file){
										if (err) {
											res.sendStatus(400);
											res.json(err);
											logger.error(err);
										} else {
											fs.unlink(UPLOAD_PATH_VIDEOS + '/' + article.file.filename, (err) => {
												if (err) {
													res.json(err);
													logger.error(err);
												}
												logger.info(`${article.file.filename} was deleted`);
											});
											fs.unlink(UPLOAD_PATH_VIDEOS + '/convert_' + article.file.filename.substring(0, article.file.filename.lastIndexOf('.')) + '.mp4', (err) => {
												if (err) {
													res.json(err);
													logger.error(err);
												}
												logger.info(`${article.file.filename} was deleted`);
											});
											fs.unlink(UPLOAD_PATH_VIDEOS + '/convert_' + article.file.filename.substring(0, article.file.filename.lastIndexOf('.')) + '.ogv', (err) => {
												if (err) {
													res.json(err);
													logger.error(err);
												}
												logger.info(`${article.file.filename} was deleted`);
											});
											fs.unlink(UPLOAD_PATH_VIDEOS + '/convert_' + article.file.filename.substring(0, article.file.filename.lastIndexOf('.')) + '.webm', (err) => {
												if (err) {
													res.json(err);
													logger.error(err);
												}
												logger.info(`${article.file.filename} was deleted`);
											});
											fs.unlink(UPLOAD_PATH_VIDEOS + '/screenshot_' + article.file.filename.substring(0, article.file.filename.lastIndexOf('.')) + '.png', (err) => {
												if (err) {
													res.json(err);
													logger.error(err);
												}
												logger.info(`${article.file.filename} was deleted`);
											});
											article.save(saveCallback(req, res, file, user));
										}
									});
								});
							}
						} else {
							article.save(function (err, article) {
								if (err) {
									res.status(400);
									res.json(err);
									logger.error(err);
								}
								res.status(201);
								res.json(article);
								logger.info(`Updated article ${article.title}`);
							});
						}
					}); 
			}   
			if (req.headers['content-type'].indexOf('multipart/form-data') !== -1) {
				upload(req, res, function (err) {
					if (err) {
						res.send(err);
						return;
					} else {
						Article.findById(req.params.id)
							.populate('file')
							.populate('category')
							.populate('user')
							.exec(function(err, article) {
								if (req.body.title) {
									article.title = req.body.title;
								}
								if (req.body.shortBody) {
									article.shortBody = req.body.shortBody;
								}
								if (req.body.body) {
									article.body = req.body.body;
								}
								if (req.body.timeOfCreation) {
									article.timeOfCreation = req.body.timeOfCreation;
								}
								if (req.body.timeOfPublication) {
									article.timeOfPublication = req.body.timeOfPublication;
								}
								if (req.body.confirmation != undefined) {
									article.confirmation = req.body.confirmation;
								}
								if (req.body.status) {
									//TODO: change emit to broadcast
									if (article.status == 'created' && req.body.status == 'not approved by editor') {
										article.status = req.body.status;
										let articleResponse = addFileUrl(article.toJSONObject(), article.file, req, user);
										notifyUsers(req.io.sockets.clients(), req.io.sockets.connected, articleResponse, 'CN=NEWS_Author', 'Ваша новость не утверждена, необходимо редактирование', 'update', req);
									} else if (article.status == 'created' && req.body.status == 'modified') {
										article.status = req.body.status;
										let articleResponse = addFileUrl(article.toJSONObject(), article.file, req, user);
										notifyUsers(req.io.sockets.clients(), req.io.sockets.connected, articleResponse, 'CN=NEWS_publisher', 'У Вас появилась новость требующая проверки', 'update', req);
									} else if (article.status == 'not approved by editor' && req.body.status == 'created') {
										article.status = req.body.status;
										let articleResponse = addFileUrl(article.toJSONObject(), article.file, req, user);
										notifyUsers(req.io.sockets.clients(), req.io.sockets.connected, articleResponse, 'CN=NEWS_Editor', 'У Вас появилась новость требующая проверки', 'update', req);
									} else if (article.status == 'modified' && req.body.status == 'not approved by publisher') {
										article.status = req.body.status;
										let articleResponse = addFileUrl(article.toJSONObject(), article.file, req, user);
										notifyUsers(req.io.sockets.clients(), req.io.sockets.connected, articleResponse, 'CN=NEWS_Editor', 'Ваша новость не утверждена, необходимо редактирование', 'update', req);
									} else if (article.status == 'modified' && req.body.status == 'published') {
										article.timeOfPublication = Date.now();
										article.status = req.body.status;
										let articleResponse = addFileUrl(article.toJSONObject(), article.file, req, user);
										notifyUsers(req.io.sockets.clients(), req.io.sockets.connected, articleResponse, 'CN=NEWS_Reader', 'Опубликована новая новость', 'update', req);
									} else if (article.status === 'not approved by publisher' && req.body.status == 'modified') {
										article.status = req.body.status;
										let articleResponse = addFileUrl(article.toJSONObject(), article.file, req, user);
										notifyUsers(req.io.sockets.clients(), req.io.sockets.connected, articleResponse, 'CN=NEWS_publisher', 'У Вас появилась новость требующая проверки', 'update', req);
									} else {
										article.status = req.body.status;
									}
								}
								if (req.params.category_id) {
									article.category = req.params.category_id;
								}
								if (req.file) {
									const imageFileTypes = /image/;
									const videoFileTypes = /video/;
									const isImage = imageFileTypes.test(article.file.contentType);
									const isVideo = videoFileTypes.test(article.file.contentType);
									if (isImage) {
										File.findById(article.file._id, function(err, file) {
											file.filename = req.file.filename;
											file.contentType = req.file.mimetype;
											file.save(function (err, file){
												if (err) {
													res.sendStatus(400);
													res.json(err);
													logger.error(err);
												} else {
													fs.unlink(UPLOAD_PATH_IMAGES + '/' + article.file.filename, (err) => {
														if (err) {
															res.json(err);
															logger.error(err);
														}
														logger.info(`${article.file.filename} was deleted`);
													});
													fs.unlink(UPLOAD_PATH_IMAGES+ '/small-' + article.file.filename, (err) => {
														if (err) {
															res.json(err);
															logger.error(err);
														}
														logger.info(`small-${article.file.filename} was deleted`);
													});
													article.save(saveCallback(req, res, file, user));
												}
											});
										});
									} else if (isVideo) {
										File.findById(article.file._id, function(err, file) {
											file.filename = req.file.filename;
											file.contentType = req.file.mimetype;
											file.save(function (err, file){
												if (err) {
													res.sendStatus(400);
													res.json(err);
													logger.error(err);
												} else {
													fs.unlink(UPLOAD_PATH_VIDEOS + '/' + article.file.filename, (err) => {
														if (err) {
															res.json(err);
															logger.error(err);
														}
														logger.info(`${article.file.filename} was deleted`);
													});
													fs.unlink(UPLOAD_PATH_VIDEOS + '/convert_' + article.file.filename.substring(0, article.file.filename.lastIndexOf('.')) + '.mp4', (err) => {
														if (err) {
															res.json(err);
															logger.error(err);
														}
														logger.info(`${article.file.filename} was deleted`);
													});
													fs.unlink(UPLOAD_PATH_VIDEOS + '/convert_' + article.file.filename.substring(0, article.file.filename.lastIndexOf('.')) + '.ogv', (err) => {
														if (err) {
															res.json(err);
															logger.error(err);
														}
														logger.info(`${article.file.filename} was deleted`);
													});
													fs.unlink(UPLOAD_PATH_VIDEOS + '/convert_' + article.file.filename.substring(0, article.file.filename.lastIndexOf('.')) + '.webm', (err) => {
														if (err) {
															res.json(err);
															logger.error(err);
														}
														logger.info(`${article.file.filename} was deleted`);
													});
													fs.unlink(UPLOAD_PATH_VIDEOS + '/screenshot_' + article.file.filename.substring(0, article.file.filename.lastIndexOf('.')) + '.png', (err) => {
														if (err) {
															res.json(err);
															logger.error(err);
														}
														logger.info(`${article.file.filename} was deleted`);
													});
													article.save(saveCallback(req, res, file, user));
												}
											});
										});
									}
								} else {
									article.save(function (err, article) {
										if (err) {
											res.status(400);
											res.json(err);
											logger.error(err);
										}
										res.status(201);
										res.json(article);
										logger.info(`Updated article ${article.title}`);
									});
								}
							});
					}
				}); 
			}
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

function notifyUsers(clientSockets, connectedSockets, article, role, messageText, event, request) {
	User.find({ roles : role }, function (err, users) {
		if (err) return console.error(err);
		// Send notification to online users
		let socketsArray = Object.values(clientSockets.sockets);
		for (let i = 0; i < socketsArray.length; i++) {
			const socket = socketsArray[i];
			let session = socket.handshake.session;
			if (session.user && session.user.roles && Array.isArray(session.user.roles)) {
				if (role == 'CN=NEWS_Author') {
					if ((session.user.roles.indexOf(role) !== -1) && (session.user.login == article.user.login)) {
						connectedSockets[socketsArray[i].id].emit(event, article);
					}
				} else {
					if (session.user.roles.indexOf(role) !== -1) {
						connectedSockets[socketsArray[i].id].emit(event, article);
					}
				}
			} else {
				console.warn('Socket: ' + socket.id + ' has invalid session: ');
			}
		}
		// Save "event" to redis user's data who offline
		usersArray = Object.values(users);
		for (let i = 0; i < socketsArray.length; i++) {
			const socket = socketsArray[i];
			let session = socket.handshake.session;
			if (session.user && session.user.roles && Array.isArray(session.user.roles)) {
				usersArray = usersArray.filter(user => user.login != session.user.login);
			} else {
				console.warn('Socket: ' + socket.id + ' has invalid session: ');
			}
		}
		console.log(usersArray);
		for (let i = 0; i < usersArray.length; i++) {
			const topic = `${usersArray[i].login}`;
			var message = {
				notification: {
					title: 'Retail Group News',
					body: `${messageText}`,
				},
				android: {
					ttl: 3600 * 1000,
					notification: {
						icon: 'stock_ticker_update',
						color: '#576c33',
						click_action: 'FCM_PLUGIN_ACTIVITY',
						sound: 'default'
					}
				},
				topic: topic,
			};
			if (role == 'CN=NEWS_Author') {
				if (usersArray[i].login == article.user.login) {
					connectedSockets[socketsArray[i].id].emit(event, article);
				}
			} else {
				request.admin.messaging().send(message)
					.then((response) => {
						// Response is a message ID string.
						console.log('Successfully sent message:', response);
					})
					.catch((error) => {
						console.log('Error sending message:', error);
					});
			}
		// 	request.client.set(usersArray[i].login + Date.now(), JSON.stringify(article), redis.print);
		}
	});
}

// *** add or remove article like *** //
function likeArticle(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Reader', 'CN=NEWS_Author', 'CN=NEWS_publisher', 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
			Article.findById({_id: req.params.id}, function(err, article) {
				if (err) {
					res.status(400);
					res.json(err);
					logger.error(err);
				} else {
					if (article.likes.indexOf(user._id) == -1) {
						article.likes.push(user._id);
					} else {
						const num = article.likes.indexOf(user._id);
						article.likes.splice(num, 1);
					}
					article.save(function(err, article) {
						if(err) {
							res.status(400);
							res.json(err);
							logger.error(err);
						}
						res.json(article);
					});	
				}
			});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

// *** delete SINGLE article *** //
function deleteArticle(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Administrator')) {
			Article.findByIdAndDelete(req.params.id)
				.populate('file')
				.exec(function (err, article) {
					if (err) {
						res.json(err);
					} else {
						Comment.deleteMany({article: article._id}, function (err) {
							if (err) {
								res.status(400);
								res.json(err);
								logger.error(err);
							}
							logger.info(`Comments deleted for article ${article.title}`);
						});
						CommentByEditor.deleteMany({article: article._id}, function (err) {
							if (err) {
								res.status(400);
								res.json(err);
								logger.error(err);
							}
							logger.info(`CommentByEditor deleted for article ${article.title}`);
						});
						CommentByPublisher.deleteMany({article: article._id}, function (err) {
							if (err) {
								res.status(400);
								res.json(err);
								logger.error(err);
							}
							logger.info(`CommentByPublisher deleted for article ${article.title}`);
						});
						// TODO: to separate function image or video
						const imageFileTypes = /image/;
						const videoFileTypes = /video/;
						const isImage = imageFileTypes.test(article.file.contentType);
						const isVideo = videoFileTypes.test(article.file.contentType);
						if (isImage) {
							File.deleteOne({_id: article.file.id}, function (err) {
								if (err) {
									res.json(err);
									logger.error(err);
								}
								logger.info(`File delete for article ${article.title}`);
								fs.unlink(UPLOAD_PATH_IMAGES + '/' + article.file.filename, (err) => {
									if (err) {
										res.json(err);
										logger.error(err);
									}
									logger.info(`${article.file.filename} was deleted`);
								});
								fs.unlink(UPLOAD_PATH_IMAGES+ '/small-' + article.file.filename, (err) => {
									if (err) {
										res.json(err);
										logger.error(err);
									}
									logger.info(`small-${article.file.filename} was deleted`);
								});
							});
						} else if (isVideo) {
							File.deleteOne({_id: article.file.id}, function (err) {
								if (err) {
									res.json(err);
									logger.error(err);
								} 
								logger.info(`File delete for article ${article.title}`);
								fs.unlink(UPLOAD_PATH_VIDEOS + '/' + article.file.filename, (err) => {
									if (err) {
										res.json(err);
										logger.error(err);
									}
									logger.info(`${article.file.filename} was deleted`);
								});
								fs.unlink(UPLOAD_PATH_VIDEOS + '/convert_' + article.file.filename.substring(0, article.file.filename.lastIndexOf('.')) + '.mp4', (err) => {
									if (err) {
										res.json(err);
										logger.error(err);
									}
									logger.info(`${article.file.filename} was deleted`);
								});
								fs.unlink(UPLOAD_PATH_VIDEOS + '/convert_' + article.file.filename.substring(0, article.file.filename.lastIndexOf('.')) + '.ogv', (err) => {
									if (err) {
										res.json(err);
										logger.error(err);
									}
									logger.info(`${article.file.filename} was deleted`);
								});
								fs.unlink(UPLOAD_PATH_VIDEOS + '/convert_' + article.file.filename.substring(0, article.file.filename.lastIndexOf('.')) + '.webm', (err) => {
									if (err) {
										res.json(err);
										logger.error(err);
									}
									logger.info(`${article.file.filename} was deleted`);
								});
								fs.unlink(UPLOAD_PATH_VIDEOS + '/screenshot_' + article.file.filename.substring(0, article.file.filename.lastIndexOf('.')) + '.png', (err) => {
									if (err) {
										res.json(err);
										logger.error(err);
									}
									logger.info(`${article.file.filename} was deleted`);
								});
							});
						}
						res.json(article);
						logger.info(`Deleted article ${article.title}`);
					}
				});
		} else {
			res.status(403);
			res.send('Access denied');
		}
	})(req, res, next);
}

module.exports = router;