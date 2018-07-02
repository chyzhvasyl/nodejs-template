const express = require('express');
const router = express.Router();
const Article = require('../models/article');
const Comment = require('../models/comment');
const intel = require('intel');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

// *** multer configuration *** //
var storage = multer.diskStorage({
  destination: './server/uploads',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({
  storage: storage,
  limits:{fileSize: 100000000000},
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  } 
}).single('profileImage');

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
router.post('/articles', addArticle);
router.put('/article/:id', updateArticle);
router.delete('/article/:id', deleteArticle);

// *** get ALL articles *** //
function findAllArticles(req, res) {
  Article.find(function(err, articles) {
    if(err) {
      res.json({'ERROR': err});
      intel.error("ERROR ", err);
    } else {
      res.json(articles);
      intel.info("Take all articles ", articles);
    }
  });
}

// *** get SINGLE article *** //
function findArticleById(req, res) {
  Article.findById(req.params.id, function(err, article) {
    if(err) {
      res.json({'ERROR': err});
      intel.error("ERROR ", err);
    } else {
      res.json(article);
      intel.info('Get single article ', article);
    }
  });
}

// *** post add SINGLE article  *** //
function addArticle(req, res) {
  upload(req, res, function (err) {
    if (err) {
      res.json({'ERROR': err});
      intel.error("ERROR ", err);
      return
    } else {
      if (req.file != undefined) {
        const newArticle = new Article();
        newArticle.title = req.body.title;
        newArticle.body = req.body.body;
        newArticle.img.data = fs.readFileSync(req.file.path);
        // newArticle.img.contentType = 'image/jpg';
        newArticle.timeOfCreation = req.body.timeOfCreation;
        newArticle.timeOfPublication = req.body.timeOfPublication;
        newArticle.category = req.body.category;
        newArticle.confirmation = req.body.confirmation;
        newArticle.status = req.body.status;
        newArticle.save(function(err, newArticle) {
          if (err) {
            res.json({'ERROR': err});
            intel.error("ERROR ", err);
          } else {
            res.json({'SUCCESS': newArticle});
            intel.info('Added new article ', newArticle);
          }
        }); 
      } else {
        const newArticle = new Article();
        newArticle.title = req.body.title;
        newArticle.body = req.body.body;
        newArticle.timeOfCreation = req.body.timeOfCreation;
        newArticle.timeOfPublication = req.body.timeOfPublication;
        newArticle.category = req.body.category;
        newArticle.confirmation = req.body.confirmation;
        newArticle.status = req.body.status;
        newArticle.save(function(err, newArticle) {
          if (err) {
            res.json({'ERROR': err});
            intel.error("ERROR ", err);
          } else {
            res.json({'SUCCESS': newArticle});
             intel.info('Added new article ', newArticle);
          }
        }); 
      }
    } 
  });
};  

// *** put SINGLE article *** //
function updateArticle(req, res) {
  upload(req, res, function (err) {
    if (err) {
      res.json({'ERROR': err});
      intel.error("ERROR ", err);
      return
    } else {
      if (req.file != undefined) {
        Article.findById(req.params.id, function(err, article) {
          article.title = req.body.title;
          article.body = req.body.body;
          article.img.data = fs.readFileSync(req.file.path);
          // article.img.contentType = 'image/jpg';
          article.timeOfCreation = req.body.timeOfCreation;
          article.timeOfPublication = req.body.timeOfPublication;
          article.category = req.body.category;
          article.confirmation = req.body.confirmation;
          article.status = req.body.status;
          article.comments = req.body.comments;
          article.save(function(err) {
            if(err) {
              res.json({'ERROR': err});
              intel.error("ERROR ", err);
            } else {
              res.json({'UPDATED': article});
              intel.info('Updated article ', article);
            }
          });
        });
      } else {
        Article.findById(req.params.id, function(err, article) {
          article.title = req.body.title;
          article.body = req.body.body;
          article.timeOfCreation = req.body.timeOfCreation;
          article.timeOfPublication = req.body.timeOfPublication;
          article.category = req.body.category;
          article.confirmation = req.body.confirmation;
          article.status = req.body.status;
          article.comments = req.body.comments;
          article.save(function(err) {
            if(err) {
              res.json({'ERROR': err});
              intel.error("ERROR ", err);
            } else {
              res.json({'UPDATED': article});
              intel.info('Updated article ', article);
            }
          });
        });
      }
      
    }
  });
}

// *** delete SINGLE article *** //
function deleteArticle(req, res) {
  Article.findById(req.params.id, function(err, article) {
    if(err) {
      res.json({'ERROR': err});
    } else {
      article.remove(function(err){
        if(err) {
          res.json({'ERROR': err});
          intel.error("ERROR ", err);
        } else {
          res.json({'REMOVED': article});
          intel.info('Deleted article ', article);
        }
      });
    }
  });
}

module.exports = router;