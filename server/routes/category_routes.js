const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const Article = require('../models/article');
const passport = require('passport');
const logger = require('../logs/logger');
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
			Category.find().exec(function(err, categories) {
				if(err) {
					res.status(400);
					res.json(err);
					logger.error(err);
				} else {
					res.json(categories);
					logger.info(`Get all categories ${categories.length}`);
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
					logger.error(err);
				} else {
					res.json(category);
					logger.info(`Get single category by id ${category._id}`);
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
					logger.error(err);
				} else {
					res.json(newCategory);
					logger.info(`Added new category ${newCategory.name}`);
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
		if (err) { 
			return next(err);
		}
		if (util.hasRole(user, 'CN=NEWS_Editor', 'CN=NEWS_Administrator')) {
			Category.findById(req.params.id, function(err, updatedCategory) {
				updatedCategory.name = req.body.name;
				updatedCategory.save(function(err) {
					if(err) {
						res.status(400);
						res.json(err);
						logger.error(err);
					} else {
						res.json(updatedCategory);
						logger.info(`Updated category ${updatedCategory.name}`);
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
		if (err) { 
			return next(err);
		}
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
								logger.error(err);
							} else {
								if (templateCategory != null) {
									Article.where({ category : deletedCategory._id }).updateMany({ $set: { category : templateCategory._id }}).exec(function(err){
										if (err) {
											res.status(400);
											res.json(err);
											logger.error(err);
										}
										res.json(deletedCategory);
										logger.info(`Deleted category ${deletedCategory.name}`);
									});
								} else {

									const newTemplateCategory = new Category({
										name: 'прочее'
									});
                    
									newTemplateCategory.save(function(err, newTemplateCategory) {
										if(err) {
											res.status(400);
											res.json(err);
											logger.error(err);
										} else {
											Article.where({ category : deletedCategory._id }).updateMany({ $set: { category : newTemplateCategory._id }}).exec(function(err){
												if (err) {
													res.status(400);
													res.json(err);
													logger.error(err);
												}
												res.json(deletedCategory);
												logger.info(`Deleted category ${deletedCategory.name}`);
											});
											logger.info(`Added new category ${newTemplateCategory.name}`);
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