const express = require('express');
const router = express.Router();
const User = require('../models/user');
const intel = require('intel');
const uuid = require('uuid/v4');

// FIXME: All user routes
// *** api routes *** //
router.get('/users', findAllUsers);
// router.get('/user/:id', findUserById);
router.post('/user', addUser);
// router.put('/user/:id', updateUser);
// router.delete('/user/:id', deleteUser);

// *** get ALL users *** //
function findAllUsers(req, res) {
  User.find(function(err, users) {
    if(err) {
      res.json(err);
      intel.error(err);
    } else {
      res.json(users);
      intel.info("Take all users ", users);
    }
  });
}

// *** get SINGLE category by id *** //
// function findCategoryById(req, res) {
//   Category.findById(req.params.id, function(err, category) {
//     if(err) {
//       res.status(404);
//       res.json(err);
//       intel.error(err);
//     } else {
//       res.json(category);
//       intel.info('Get single category by id ', category);
//     }
//   });
// }

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

// *** uodate SINGLE category *** //
// function updateCategory(req, res) {
//   Category.findById(req.params.id, function(err, category) {
//     category.name = req.body.name;
//     category.save(function(err) {
//       if(err) {
//         res.status(400);
//         res.json(err);
//         intel.error(err);
//       } else {
//         res.json(category);
//         intel.info('Updated category ', category);
//       }
//     });
//   });
// }

// *** delete SINGLE category *** //
// function deleteCategory(req, res) {
//   Category.findByIdAndDelete(req.params.id, function(err, category) {
//     if(err) {
//       res.json(err);
//     } else {
//         Article.where({ category : category.id }).updateMany({ $set: {category : '5b83a8c043bf5623488d0bc6'}}).exec(function(err){
//           if (err) {
//             res.json(err);
//           }
//           res.json(category);
//           intel.info('Deleted category ', category);
//         });
//       }
//   });
// }

module.exports = router;