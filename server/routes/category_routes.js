const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const Article = require('../models/article');
const intel = require('intel');
const passport = require('passport');
const util = require('../util');

// *** api routes *** //
router.get('/categories', findAllCategories);
router.get('/category/:id', findCategoryById);
router.post('/category', addCategory);
router.put('/category/:id', updateCategory);
router.delete('/category/:id', deleteCategory);

// *** get ALL categories *** //
function findAllCategories(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Reader', 'CN=NEWS_Author', 'CN=NEWS_publisher', 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
			Category.find(function(err, categories) {
				if(err) {
					res.status(400);
					res.json(err);
					intel.error(err);
				} else {
					res.json(categories);
					intel.info('Get all categories ', categories);
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
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Reader', 'CN=NEWS_Author', 'CN=NEWS_publisher', 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
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
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
			const newCategory = new Category({
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
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
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
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (util.hasRole(user, 'CN=NEWS_Administrator')) {
			Category.findByIdAndDelete(req.params.id, function(err, deletedCategory) {
				if(err) {
					res.json(err);
				} else {
					Category.findOne({name:{'$regex' : '^прочее$', '$options' : 'i'}})
						.populate('article')
						.exec(function(err, templateCategory) {
							if(err) {
								res.status(400);
								res.json(err);
								intel.error(err);
							} else {
								if (templateCategory != null) {
									Article.where({ category : deletedCategory._id }).updateMany({ $set: { category : templateCategory._id }}).exec(function(err){
										if (err) {
											res.status(400);
											res.json(err);
											intel.error(err);
										}
										res.json(deletedCategory);
										intel.info('Deleted category ', deletedCategory);
									});
								} else {

									const newTemplateCategory = new Category({
										name: 'прочее'
									});
                    
									newTemplateCategory.save(function(err, newTemplateCategory) {
										if(err) {
											res.status(400);
											res.json(err);
											intel.error(err);
										} else {
											Article.where({ category : deletedCategory._id }).updateMany({ $set: { category : newTemplateCategory._id }}).exec(function(err){
												if (err) {
													res.status(400);
													res.json(err);
													intel.error(err);
												}
												res.json(deletedCategory);
												intel.info('Deleted category ', deletedCategory);
											});
											intel.info('Added new category ', newTemplateCategory);
										}
									});
								}
							}
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