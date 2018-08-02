const express = require('express');
const router = express.Router();
const multer = require('multer');
const intel = require('intel');
const fs = require('fs');
const path = require('path');
const Article = require('../models/article');
const Comment = require('../models/comment');
const Img = require('../models/image');
const UPLOAD_PATH = './server/uploads';

// *** multer configuration *** //
let storage = multer.diskStorage({
    destination: UPLOAD_PATH,
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

let upload = multer({
    storage: storage,
    limits: {fileSize: 10 * 1024 * 1024},
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('img');

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images only!');
  }
}

// *** api routes *** //
router.get('/articles', findAllArticles);
router.get('/article/:id', findArticleById);
router.get('/articles/:category_id', findAllArticlesByCategory);
router.get('/articles/:confirmation', findAllArticlesByConfirmation);


router.post('/article/:category_id', addArticle);
router.put('/article/:id', updateArticle);
router.put('/article/:id/categoty/:category_id', updateArticle);
router.put('/article/:id/like/:is_liked', likeArticle);
router.delete('/article/:id', deleteArticle);

function addImageUrl(article, req) {
    if (article && article.image && article.image._id) {
        article['imgUrl'] = req.protocol + "://" + req.get('host') + '/image/' + article.image._id;
    }
    return article;
}

// *** get ALL articles *** //
function findAllArticles(req, res) {
  Article.find({}, '-__v')
    .populate('comments')
    .populate('category')
    .populate('image')
    .lean()
    .exec(function(err, articles) {
        if(err) {
            res.status(400);
            res.json(err);
            intel.error(err);
        } else {
            articles = articles.map(a => addImageUrl(a, req));
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
    .populate('image')
    .lean()
    .exec(function(err, article) {
        if(err) {
            res.status(400);
            res.json(err);
            intel.error(err);
        } else {
            article = addImageUrl(article, req);
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
  .populate('image')
  .exec(function(err, articles){
    if(err) {
      res.status(400);
      res.json(err);
      intel.error(err);
    } else {
        articles = articles.map(a => addImageUrl(a, req));
        res.json(articles);
        intel.info("Get all articles by category" + req.params.category, articles);
    }
  });
}
// *** get All articles by confirmation *** //
function findAllArticlesByConfirmation(req, res) {
    Article.find({'confirmation':req.params.confirmation}, function(err, articles){
        if(err) {
            res.status(400);
            res.json(err);
            intel.error(err);
        } else {
            articles = articles.map(a => addImageUrl(a, req));
            res.json();
            intel.info("Get all articles by confirmation" + req.params.confirmation, articles);
        }
    });
}

// *** add SINGLE article  *** //
function addArticle(req, res) {
    upload(req, res, function (err) {
        if (err) {
            res.sendStatus(400);
            res.json(err);
            intel.error(err);
        }
        if (req.file) {
            let newImage = createImageModel(req);
            newImage.save(function (err, newImage) {
                if (err) {
                    res.sendStatus(400);
                    res.json(err);
                    intel.error(err);
                }
                let articleModel = createArticleModel(req, newImage._id);
                articleModel.save(function (err, article) {
                    if (err) {
                        res.sendStatus(400);
                        intel.error('Can\'t save article ', err);
                    } else {
                        let articleResponse = addImageUrl(article.toJSONObject(), req);
                        res.status(201);
                        res.json(articleResponse);
                        intel.info('Added new article ', articleResponse);
                    }
                });
            });
        }
    });
}

// *** update SINGLE article *** //
function updateArticle(req, res) {
    upload(req, res, function (err) {
        if (err) {
            res.status(400);
            res.json(err);
            intel.error(err);
        } else {
            if (req.file) {
                const articleId = req.params.id;
                if (req.body.image) {
                    const oldImage = req.body.image;
                    fs.unlink(path.join(UPLOAD_PATH, oldImage.filename), function (err) {
                        if (err) {
                            intel.error(`Something went wrong when deleting file for article[${articleId}]`)
                        } else {
                            intel.info(`Deleted image for article[${articleId}]`);
                        }
                    });
                }
                const imageModel = createImageModel(req);
                imageModel.update(function (err, updatedImage) {
                    if (err) {
                        res.status(400);
                        res.json(err);
                        intel.error(err);
                    } else {
                        const articleToUpdate = createArticleModel(req, req.body.image);
                        articleToUpdate.update(function (err, updatedArticle) {
                            if (err) {
                                res.status(400);
                                res.json(err);
                                intel.error(err);
                            } else {
                                updatedArticle = addImageUrl(updatedArticle.toJSONObject(), req);
                                res.json(updatedArticle);
                                intel.info('Updated article ', updatedArticle);
                            }
                        });
                    }
                });
            }
        }
    });
}

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
  Article.findByIdAndDelete(req.params.id, function (err, article) {
    if (err) {
      res.json(err);
    } else {
        Comment.deleteMany({article: req.params.id}, function (err) {
            intel.info(`Comments deleted for article[${req.params.id}]`);
        });
      res.json(article);
      intel.info('Deleted article ', article);
    }
  });
}

//helper functions
function createArticleModel(req, imageId) {
    const newArticle = new Article();
    if (req.body.title) {
        article.title = req.body.title;
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
    if (req.body.confirmation) {
        article.confirmation = req.body.confirmation;
    }
    if (req.body.status) {
        article.status = req.body.status;
    }
    if (req.params.category_id) {
        article.category = req.params.category_id;
    }
    if (imageId) {
        newArticle.image = imageId;
    }
    return newArticle;
}

function createImageModel(req) {
    const newImage = new Img();
    if (req.body.image) {
        if (req.body.image._id) {
            newImage._id = req.body.image._id;
        }
    }
    if (req.file.filename) {
        newImage.filename = req.file.filename;
    }
    if (req.file.originalname) {
        newImage.originalname = req.file.originalname;
    }
    if (req.file.mimetype) {
        newImage.contentType = req.file.mimetype;
    }
    return newImage;
}

module.exports = router;