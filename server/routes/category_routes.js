const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const Article = require('../models/article');
const intel = require('intel');
const passport = require('passport');

// *** api routes *** //
router.get('/categories', findAllCategories);
router.get('/category/:id', findCategoryById);
router.post('/category', addCategory);
router.put('/category/:id', updateCategory);
router.delete('/category/:id', deleteCategory);

// *** get ALL categories *** //
function findAllCategories(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (user && user.roles && user.roles.includes('CN=NEWS_publisher')) { 
      Category.find(function(err, categories) {
        if(err) {
          res.json(err);
          intel.error(err);
        } else {
          res.json(categories);
          intel.info("Take all categories ", categories);
        }
      });
    } else {
        res.status(403);
        res.send('Access denied');
    }
  })(req, res, next);
}

// *** get SINGLE category by id *** //
function findCategoryById(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (user && user.roles && user.roles.includes('CN=NEWS_publisher')) { 
      Category.findById(req.params.id, function(err, category) {
        if(err) {
          res.status(404);
          res.json(err);
          intel.error(err);
        } else {
          res.json(category);
          intel.info('Get single category by id ', category);
        }
      });
    } else {
        res.status(403);
        res.send('Access denied');
    }
  })(req, res, next);
}

// *** add SINGLE category *** //
function addCategory(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (user && user.roles && user.roles.includes('CN=NEWS_publisher')) { 
      var newCategory = new Category({
        name: req.body.name
      });
    
      newCategory.save(function(err, newCategory) {
        if(err) {
          res.status(400);
          res.json(err);
          intel.error(err);
        } else {
          res.json(newCategory);
          intel.info('Added new category ', newCategory);
        }
      });
    } else {
        res.status(403);
        res.send('Access denied');
    }
  })(req, res, next);
}

// *** update SINGLE category *** //
function updateCategory(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (user && user.roles && user.roles.includes('CN=NEWS_publisher')) { 
      Category.findById(req.params.id, function(err, category) {
        category.name = req.body.name;
        category.save(function(err) {
          if(err) {
            res.status(400);
            res.json(err);
            intel.error(err);
          } else {
            res.json(category);
            intel.info('Updated category ', category);
          }
        });
      });
    } else {
        res.status(403);
        res.send('Access denied');
    }
  })(req, res, next);
}

// *** delete SINGLE category *** //
function deleteCategory(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (user && user.roles && user.roles.includes('CN=NEWS_publisher')) { 
      Category.findByIdAndDelete(req.params.id, function(err, category) {
        if(err) {
          res.json(err);
        } else {
            // TODO: проверка если нет категории прочее(uppercase, lowercase)
            Article.where({ category : category.id }).updateMany({ $set: { category : '5b83a8c043bf5623488d0bc6' }}).exec(function(err){
              if (err) {
                res.json(err);
              }
              res.json(category);
              intel.info('Deleted category ', category);
            });
          }
      });
    } else {
        res.status(403);
        res.send('Access denied');
    }
  })(req, res, next);
}

module.exports = router;