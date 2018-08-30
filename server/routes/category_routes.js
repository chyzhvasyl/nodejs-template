const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const Article = require('../models/article');
const intel = require('intel');

// *** api routes *** //
router.get('/categories', findAllCategories);
router.get('/category/:id', findCategoryById);
router.post('/category', addCategory);
router.put('/category/:id', updateCategory);
router.delete('/category/:id', deleteCategory);

// *** get ALL categories *** //
function findAllCategories(req, res) {
  Category.find(function(err, categories) {
    if(err) {
      res.json(err);
      intel.error(err);
    } else {
      res.json(categories);
      intel.info("Take all categories ", categories);
    }
  });
}

// *** get SINGLE category by id *** //
function findCategoryById(req, res) {
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
}

// *** add SINGLE category *** //
function addCategory(req, res) {
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
}

// *** update SINGLE category *** //
function updateCategory(req, res) {
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
}

// *** delete SINGLE category *** //
function deleteCategory(req, res) {
  Category.findByIdAndDelete(req.params.id, function(err, category) {
    if(err) {
      res.json(err);
    } else {
        Article.where({ category : category.id }).updateMany({ $set: { category : '5b83a8c043bf5623488d0bc6' }}).exec(function(err){
          if (err) {
            res.json(err);
          }
          res.json(category);
          intel.info('Deleted category ', category);
        });
      }
  });
}

module.exports = router;