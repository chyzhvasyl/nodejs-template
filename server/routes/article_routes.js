const express = require('express');
const router = express.Router();
const Article = require('../models/article');
const Img = require('../models/image');
const intel = require('intel');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
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

function checkFileType(file, cb){
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
router.post('/article/:category_id', addArticle);
router.put('/article/:id/:category_id?', updateArticle);
router.post('/article/:id/image/', saveImage);
router.get('/image/:id/', findImageById);
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

// *** save or update SINGLE article's image  *** //
function saveImage(req, res) {
    upload(req, res, function (err) {
        if (err) {
            res.sendStatus(400);
            res.json(err);
            intel.error(err);
        }
        let newImage;
        if (req.file) {
            newImage = new Img();
            newImage.filename = req.file.filename;
            newImage.originalname = req.file.originalname;
            newImage.contentType = req.file.mimetype;
            if (newImage) {
                newImage.article = req.params.id;
                newImage.save(function (err, newImage) {
                    if (err) {
                        res.sendStatus(400);
                        res.json(err);
                        intel.error(err);
                    }
                    Article.findOneAndUpdate(req.params.id, {image: newImage._id}, function (err) {
                        if (err) {
                            res.sendStatus(400);
                            res.json({id: newImage._id});
                            intel.error(err);
                        }
                        res.sendStatus(201);
                    });

                });
            }
        }
    });
}

function findImageById(req, res) {
  let imgId = req.params.id;
  Img.findById(imgId, (err, img) => {
      if (err) {
          res.sendStatus(400);
          res.json(err);
          intel.error(err);
      }
      res.setHeader('Content-Type', img.contentType);
      fs.createReadStream(path.join(UPLOAD_PATH, img.filename)).pipe(res);
  });
}

// *** add SINGLE article  *** //
function addArticle(req, res) {
    if (err) {
      res.status(400);
      res.json(err);
      intel.error(err);
    } else {
      const newArticle = new Article();
      newArticle.title = req.body.title;
      newArticle.body = req.body.body;
      newArticle.timeOfCreation = req.body.timeOfCreation;
      newArticle.timeOfPublication = req.body.timeOfPublication;
      newArticle.category = req.body.category;
      newArticle.confirmation = req.body.confirmation;
      newArticle.status = req.body.status;
      newArticle.category = req.params.category_id;
      newArticle.save(function(err, newArticle) {
      if (err) {
        res.sendStatus(400);
        res.json(err);
        intel.error(err);
      } else {
        newArticle = addImageUrl(newArticle, req);
        res.json(newArticle);
        intel.info('Added new article ', newArticle);
      }
      }); 
    } 
}
// *** update SINGLE article *** //
function updateArticle(req, res) {
    if (err) {
      res.status(400);
      res.json(err);
      intel.error(err);
    } else {
      Article.findById(req.params.id, function(err, article) {
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
        if (req.params.is_liked == false) {
          article.likes++;
        } else {
          article.likes--;
        }
        if (req.params.category_id) {
          article.category = req.params.category_id;
        }
        article.save(function(err) {
          if(err) {
            res.status(400);
            res.json(err);
            intel.error(err);
          } else {
            article = addImageUrl(article, req);
            res.json(article);
            intel.info('Updated article ', article);
          }
        });
      });
    }
}

function likeArticle(req, res) {
  console.log(req.params);
  let likeAction;
  if(req.params.is_liked == 'false') {
    likeAction = { $inc: { likes: 1 }};
  } else {
    likeAction = { $inc: { likes: -1 }};
  }
  console.log(likeAction);
  Article.findOneAndUpdate(req.params.id, likeAction, function(err, article) {
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
  Article.findByIdAndDelete(req.params.id, function(err, article) {
    if(err) {
      res.json(err);
    } else {
        res.json(article);
        intel.info('Deleted article ', article);
      }
  });
}

module.exports = router;