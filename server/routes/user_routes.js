const express = require('express');
const router = express.Router();
const User = require('../models/user');
const intel = require('intel');

// *** api routes *** //
router.get('/users', findAllUsers);
router.get('/user/:id', findUserById);
router.get('/users/:user_role', findAllUsersByRole);
router.post('/user', addUser);
router.put('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);

// *** get ALL users *** //
function findAllUsers(req, res) {
	User.find(function(err, users) {
		if(err) {
			res.status(400);
			res.json(err);
			intel.error(err);
		} else {
			res.json(users);
			intel.info('Get all users ', users);
		}
	});
}

// *** get ALL users *** //
function findAllUsersByRole(req, res) {
	User.find({ roles: req.params.user_role }, function(err, users) {
		if(err) {
			res.status(400);
			res.json(err);
			intel.error(err);
		} else {
			res.json(users);
			intel.info('Get all users by role ', users);
		}
	});
}

// *** get SINGLE user by id *** //
function findUserById(req, res) {
	User.findById(req.params.id, function(err, user) {
		if(err) {
			res.status(404);
			res.json(err);
			intel.error(err);
		} else {
			res.json(user);
			intel.info('Get single user by id ', user);
		}
	});
}

// *** add SINGLE user *** //
function addUser(req, res) {
	const newUser = new User({
		token: req.body.token,
		login: req.body.login,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		secondaryName: req.body.secondaryName,
		roles: req.body.roles
	});

	newUser.save(function(err, newUser) {
		if(err) {
			res.status(400);
			res.json(err);
			intel.error(err);
		} else {
			res.json(newUser);
			intel.info('Added new user ', newUser);
		}
	});
}

// *** update SINGLE user *** //
function updateUser(req, res) {
	User.findById(req.params.id, function(err, user) {
		user.token = req.body.token;
		user.login = req.body.login;
		user.firstName = req.body.firstName;
		user.lastName = req.body.lastName;
		user.secondaryName = req.body.secondaryName;
		user.roles = req.body.roles;
		user.save(function(err) {
			if(err) {
				res.status(400);
				res.json(err);
				intel.error(err);
			} else {
				res.json(user);
				intel.info('Updated user ', user);
			}
		});
	});
}

// *** delete SINGLE user *** //
function deleteUser(req, res) {
	User.findByIdAndDelete(req.params.id, function(err, user) {
		if(err) {
			res.json(err);
		} else {
			res.json(user);
			intel.info('Deleted user ', user);
		}
	});
}

module.exports = router;