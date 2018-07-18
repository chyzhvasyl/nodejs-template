const express = require('express');
const router = express.Router();
const Category = require('../models/category');
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
      res.json({'ERROR': err});
      intel.error("ERROR ", err);
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
      res.json({'ERROR': err});
      intel.error("ERROR ", err);
    } else {
      res.json(category);
      intel.info('Get single category by id ', category);
    }
  });
}

// *** add SINGLE category *** //
function addCategory(req, res) {
  var newCategory = new Category({
    name: req.body.name,
  });

  newCategory.save(function(err, newCategory) {
    if(err) {
      res.json({'ERROR': err});
      intel.error("ERROR ", err);
    } else {
      res.json({'SUCCESS': newCategory});
      intel.info('Added new category ', newCategory);
    }
  });
}

// *** uodate SINGLE category *** //
function updateCategory(req, res) {
  Category.findById(req.params.id, function(err, category) {
    category.name = req.body.name;
    category.save(function(err) {
      if(err) {
        res.json({'ERROR': err});
        intel.error("ERROR ", err);
      } else {
        res.json({'UPDATED': category});
        intel.info('Updated category ', category);
      }
    });
  });
}

// *** delete SINGLE category *** //
function deleteCategory(req, res) {
  Category.findById(req.params.id, function(err, category) {
    if(err) {
      res.json({'ERROR': err});
    } else {
      category.remove(function(err){
        if(err) {
          res.json({'ERROR': err});
          intel.error("ERROR ", err);
        } else {
          res.json({'REMOVED': category});
          intel.info('Deleted category ', category);
        }
      });
    }
  });
}

module.exports = router;