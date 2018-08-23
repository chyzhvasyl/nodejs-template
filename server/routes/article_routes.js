const express = require('express');
const router = express.Router();
const multer = require('multer');
const intel = require('intel');
const fs = require('fs');
const mime = require('mime');
const path = require('path');
const Article = require('../models/article');
const Comment = require('../models/comment');
const File = require('../models/file');
const UPLOAD_PATH = './server/uploads';
const UPLOAD_PATH_IMAGES = UPLOAD_PATH + '/images';
const UPLOAD_PATH_VIDEOS = UPLOAD_PATH + '/videos';
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');

// *** api routes *** //
router.get('/articles', findAllArticles);
router.get('/article/:id', findArticleById);
router.get('/articles/category/:category_id', findAllArticlesByCategory);
router.get('/articles/confirmation/:confirmation', findAllArticlesByConfirmation);
router.post('/article/:category_id/:template_id?', addArticle);
router.put('/article/:id/:category_id?', updateArticle);
router.put('/article/:id/like/:is_liked', likeArticle);
router.delete('/article/:id', deleteArticle);

// *** get ALL articles *** //
function findAllArticles(req, res) {
  Article.find()
    .populate('comments')
    .populate('category')
    .populate('file')
    .populate('template')
    .lean()
    .exec(function(err, articles) {
        if(err) {
            res.status(400);
            res.json(err);
            intel.error(err);
        } else {
            articles = articles.map(a => addFileUrl(a, a.file, req));
            res.json(articles);
            intel.info("Get all articles ", articles);
        }
  }); 
}

// *** get SINGLE article by id *** //
function findArticleById(req, res) {
  Article.findById(req.params.id)
    .populate('comments')
    .populate('category')
    .populate('file')
    .populate('template')
    .lean()
    .exec(function(err, article) {
        if(err) {
            res.status(400);
            res.json(err);
            intel.error(err);
        } else {
            article = addFileUrl(article, article.file, req);
            res.json(article);
            intel.info('Get single article by id ', article);
        }
  });
}

// *** get All articles by category *** //
function findAllArticlesByCategory(req, res) {
  Article.find({'category':req.params.category_id})
  .populate('comments')
  .populate('category')
  .populate('file')
  .populate('template')
  .lean()
  .exec(function(err, articles){
    if(err) {
      res.status(400);
      res.json(err);
      intel.error(err);
    } else {
        articles = articles.map(a => addFileUrl(a, a.file, req));
        res.json(articles);
        intel.info("Get all articles by category" + req.params.category, articles);
    }
  });
}

// *** get All articles by confirmation *** //
function findAllArticlesByConfirmation(req, res) {
    Article.find({'confirmation':req.params.confirmation})
    .populate('comments')
    .populate('category')
    .populate('file')
    .populate('template')
    .lean()
    .exec(function(err, articles){
      if(err) {
        res.status(400);
        res.json(err);
        intel.error(err);
      } else {
          articles = articles.map(a => addFileUrl(a, a.file, req));
          res.json(articles);
          intel.info("Get all articles by confirmation " + req.params.category, articles);
      }
    });
  }

// *** add SINGLE article  *** //
function addArticle(req, res) {
    if (req.headers['content-type'].indexOf('multipart/form-data') !== -1) {
        upload(req, res, function (err) {
            if (err) {
                res.send(err);
              // An error occurred when uploading
              return
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
                            intel.error(err);
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
                        newArticle.save(saveCallback(req, res, newFile));
                    });
                }
            }
        })
    } 
    if (req.headers['content-type'].indexOf('application/json') !== -1) {
        if (req.body.fileBase64 && req.body.fileBase64Small) {
            const curentDate = Date.now();
            const fileMeta = saveFile(req.body.fileBase64, 'img', curentDate);
            const smallFileMeta = saveFile(req.body.fileBase64Small, 'small-img', curentDate);
            const newFile = new File();
            newFile.filename = fileMeta.fileName;
            newFile.contentType = mime.getType(fileMeta.extension);
            newFile.save(function (err, newFile) {
                if (err) {
                    res.sendStatus(400);
                    res.json(err);
                    intel.error(err);
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
                newArticle.save(saveCallback(req, res, newFile));
            });
        }   
    } 
}

function saveFile(file, prefix, curentDate) {
    if (file) {
        const decodedImg = decodeBase64Image(file);
        const imageBuffer = decodedImg.data;
        const type = decodedImg.type;
        const extension = mime.getExtension(type);
        const fileName = `${prefix}-${curentDate}.${extension}`;
        try {
            fs.writeFile(UPLOAD_PATH_IMAGES + '/' + fileName, imageBuffer, 'utf8');
            return {
                fileName: fileName,
                extension: extension
            };
        } catch (err) {
            console.error(err);
            res.status(400);
            res.json(err);
        }
    }
    return {};
}   

function saveCallback( req, res, file) {
    return function (err, article) {
        if (err) {
            res.status(400);
            res.json(err);
            intel.error('Can\'t save article ', err);
        } else {
            if (file.contentType == "video/mp4") {
                convert(UPLOAD_PATH_VIDEOS + '/' + file.filename, file.filename, function(err){
                    if(!err) {
                        console.log('conversion complete');
                    }
                });
                getScreenshot(UPLOAD_PATH_VIDEOS + '/' + file.filename, file.filename, UPLOAD_PATH_VIDEOS, function(err){
                    if(!err) {
                        console.log('conversion complete');
                    }
                });
                let articleResponse = addFileUrl(article.toJSONObject(), file, req);
                res.status(201);
                res.json(articleResponse);
                intel.info('Added new article ', articleResponse);
            } else {
                let articleResponse = addFileUrl(article.toJSONObject(), file, req);
                res.status(201);
                res.json(articleResponse);
                intel.info('Added new article ', articleResponse);
            }
        }
    }
 }

function addFileUrl(article, file, req) {
    if (article && file && file._id) {
        const imageFileTypes =  /image/;
        //TODO const videoFfiletypes = /video\/pm4|video\/webm|video\/ogg|video\/x-matroska/;
        const videoFileTypes = /video/;
        const isImage = imageFileTypes.test(file.contentType);
        const isVideo = videoFileTypes.test(file.contentType);
        if (isImage) {
            article['imgUrl'] = req.protocol + "://" + req.get('host') + '/file/' + file._id;
            article['imgSmallUrl'] = req.protocol + "://" + req.get('host') + '/file-small/' + file._id;
        }
        if (isVideo) {
            article['videoOgvUrl'] = req.protocol + "://" + req.get('host') + '/video/' + file._id + '/ogv';
            article['videoMP4Url'] = req.protocol + "://" + req.get('host') + '/video/' + file._id + '/mp4';
            article['videoWebmUrl'] = req.protocol + "://" + req.get('host') + '/video/' + file._id + '/webm';
            article['screenshot'] = req.protocol + "://" + req.get('host') + '/screenshot/' + file._id;
        }
    }
    return article;
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
/**
 *    input - string, path of input file
 *    output - string, path of output file
 *    callback - function, node-style callback fn (error, result)        
 */
function convert(input, filename, callback) {
    ffmpeg(input)
        .output(UPLOAD_PATH_VIDEOS + '/' + 'convert_' + filename.substring(0, filename.lastIndexOf('.')) + '.mp4').format('mp4').size('640x480')
        .output(UPLOAD_PATH_VIDEOS + '/' + 'convert_' + filename.substring(0, filename.lastIndexOf('.')) + '.ogv').format('ogv').size('640x480')
        .output(UPLOAD_PATH_VIDEOS + '/' + 'convert_' + filename.substring(0, filename.lastIndexOf('.')) + '.webm').format('webm').size('640x480')
        .on('end', function() {                    
            console.log('conversion ended');
            callback(null)
        })
        .on('error', function(err){
            console.log('error: ', err.code, err.msg);
            callback(err);
        }).run();
}

function getScreenshot(filePath, fileName, outputFolder, callback) {
    ffmpeg(filePath)
    .on('filenames', function(filenames) {
        console.log('Will generate ' + filenames.join(', '))
        callback(null)
      })
      .on('end', function() {
        console.log('Screenshots taken');
        // callback(err);
      })
      .thumbnail({
        count: 1,
        folder: outputFolder,
        filename: 'screenshot_' + fileName.substring(0, fileName.lastIndexOf('.')) + '.png',
        size: '400x400'
      });
}

// *** update SINGLE article *** //
function updateArticle(req, res) {
    if (req.headers['content-type'].indexOf('application/json') !== -1) {
        Article.findById(req.params.id)
        .populate('file')
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
            article.status = req.body.status;
        }
        if (req.params.category_id) {
            article.category = req.params.category_id;
        }
        if (req.body.fileBase64 && req.body.fileBase64Small) {
            const curentDate = Date.now();
            const fileMeta = saveFile(req.body.fileBase64, 'img', curentDate);
            const smallFileMeta = saveFile(req.body.fileBase64Small, 'small-img', curentDate);
            fs.unlink(UPLOAD_PATH_IMAGES + '/' + article.file.filename, (err) => {
                if (err) {
                    intel.error(err);
                };
                intel.info(article.file.filename + ' was deleted.');
            });
            fs.unlink(UPLOAD_PATH_IMAGES+ '/small-' + article.file.filename, (err) => {
                if (err) {
                    intel.error(err);
                };
                intel.info('small-' + article.file.filename + ' was deleted.');
            });
            File.findById(article.file._id, function(err, file) {
                file.filename = fileMeta.fileName;
                file.contentType = mime.getType(fileMeta.extension);
                file.save(function (err, file){
                    if (err) {
                        res.sendStatus(400);
                        res.json(err);
                        intel.error(err);
                    } else {
                        article.save(saveCallback(req, res, file));
                    }
                })
            })
        } else {
            // article.save(function(err, article) {
            //     if(err) {
            //     res.json(err);
            //     intel.error(err);
            //     } else {
            //         res.json(article);
            //         intel.info('Updated article ', article);
            //     }
            // });
            //TODO review
            article.save(saveCallback(req, res, article.file));
        }
    }); 
    }   
    if (req.headers['content-type'].indexOf('multipart/form-data') !== -1) {
        Article.findById(req.params.id)
        .populate('file')
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
                article.status = req.body.status;
            }
            if (req.params.category_id) {
                article.category = req.params.category_id;
            }
            if (req.body.videoOgvUrl && req.body.fvideoMP4Url && req.body.videoWebmUrl) {
                const curentDate = Date.now();
                if (req.file) {
                    videoFilePath = UPLOAD_PATH_VIDEOS + '/' + file.filename;
                    convert(videoFilePath, file.filename, function(err){
                        if(!err) {
                            console.log('conversion complete');
                        }
                     });
                }
                fs.unlink(UPLOAD_PATH_IMAGES + '/' + article.file.filename, (err) => {
                    if (err) {
                        intel.error(err);
                    };
                    intel.info(article.file.filename + ' was deleted.');
                });
                fs.unlink(UPLOAD_PATH_IMAGES+ '/small-' + article.file.filename, (err) => {
                    if (err) {
                        intel.error(err);
                    };
                    intel.info('small-' + article.file.filename + ' was deleted.');
                });
                File.findById(article.file._id, function(err, file) {
                    file.filename = fileMeta.fileName;
                    file.contentType = mime.getType(fileMeta.extension);
                    file.save(function (err, file){
                        if (err) {
                            res.sendStatus(400);
                            res.json(err);
                            intel.error(err);
                        } else {
                            article.save(saveCallback(req, res, file));
                        }
                    })
                })
            } else {
                // article.save(function(err, article) {
                //     if(err) {
                //     res.json(err);
                //     intel.error(err);
                //     } else {
                //         res.json(article);
                //         intel.info('Updated article ', article);
                //     }
                // });
                //TODO review
                article.save(saveCallback(req,  res));
            }
    }); 
    }
}; 

// *** add or remove article like *** //
function likeArticle(req, res) {
  let likeAction;
  if (req.params.is_liked == 'false') {
    likeAction = { $inc: { likes: 1 } };
  } else {
    likeAction = { $inc: { likes: -1 } };
  }
  Article.findOneAndUpdate(req.params.id, likeAction, function (err, article) {
    if (err) {
      res.status(400);
      res.json(err);
      intel.error(err);
    } else {
      res.json(article);
    }
  })
}

// *** delete SINGLE article *** //
function deleteArticle(req, res) {
  Article.findByIdAndDelete(req.params.id)
    .populate('file')
    .exec(function (err, article) {
    if (err) {
      res.json(err);
    } else {
        Comment.deleteMany({article: article._id}, function (err) {
            if (err) {
                res.json(err);
                intel.error(err);
            }
            intel.info(`Comments deleted for article[${article._id}]`);
        });
        const imageFileTypes = /image/;
        const videoFileTypes = /video/;
        const isImage = imageFileTypes.test(article.file.contentType);
        const isVideo = videoFileTypes.test(article.file.contentType);
        if (isImage) {
            File.deleteOne({_id: article.file.id}, function (err) {
                if (err) {
                    res.json(err);
                    intel.error(err);
                } 
                intel.info(`File delete for article[${article._id}]`);
                fs.unlink(UPLOAD_PATH_IMAGES + '/' + article.file.filename, (err) => {
                    if (err) {
                        res.json(err);
                        intel.error(err);
                    };
                    intel.info(article.file.filename + ' was deleted.');
                });
                fs.unlink(UPLOAD_PATH_IMAGES+ '/small-' + article.file.filename, (err) => {
                    if (err) {
                        res.json(err);
                        intel.error(err);
                    };
                    intel.info('small-' + article.file.filename + ' was deleted.');
                });
              });
        } else if (isVideo) {
            // TODO delete video files
        }
        res.json(article);
        intel.info('Deleted article ', article);
    }
  });
}

module.exports = router;