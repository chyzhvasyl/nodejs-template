const express = require('express');
const router = express.Router();
const Template = require('../models/template');
const User = require('../models/user');
const intel = require('intel');

// *** api routes *** //
router.get('/templates', findAllTemplates);
router.get('/template/:id', findTemplateById);
router.post('/template', addTemplate);
router.put('/template/:id', updateTemplate);
router.delete('/template/:id', deleteTemplate);

// *** get ALL templates *** //
function findAllTemplates(req, res) {
  Template.find(function(err, templates) {
    if(err) {
      res.json(err);
      intel.error(err);
    } else {
      res.json(templates);
      intel.info("Get all templates ", templates);
    }
  });
}

// *** get SINGLE template *** //
function findTemplateById(req, res) {
  Template.findById(req.params.id)
  .populate('article')
  .exec(function(err, template) {
    if(err) {
      res.json(err);
      intel.error(err);
    } else {
      res.json(template);
      intel.info('Get single template by id ', template);
    }
  });
}

// *** add SINGLE template *** //
function addTemplate(req, res) {
  var newTemplate = new Template({
    generalStyles: {
      fontSizeMetric: req.body.generalStyles.fontSizeMetric,
      backgroundColor: req.body.generalStyles.backgroundColor,
    },
    articleStyles: {
      shortBody: {
        length: req.body.articleStyles.shortBody.length,
        fontSize: req.body.articleStyles.shortBody.fontSize
      },
      body: {
        length: req.body.articleStyles.body.length,
        fontSize: req.body.articleStyles.body.fontSize
      },
      title: { 
        length: req.body.articleStyles.title.length,
        fontSize: req.body.articleStyles.title.fontSize
      }
    },
    cookieLifeTime : req.body.cookieLifeTime
  });

  newTemplate.save(function(err, newTemplate) {
    if(err) {
      res.status(400);
      res.json(err);
      intel.error("ERROR ", err);
    } else {
      res.json(newTemplate);
      intel.info('Added new template ', newTemplate);
    }
  });
};

// *** update SINGLE template *** //
function updateTemplate(req, res) {
  Template.findById(req.params.id, function(err, template) {
    if (req.body.generalStyles.fontSizeMetric) {
      template.generalStyles.fontSizeMetric = req.body.generalStyles.fontSizeMetric;
    } 
    if (req.body.generalStyles.backgroundColor) {
      template.generalStyles.backgroundColor = req.body.generalStyles.backgroundColor;
    }
    if (req.body.articleStyles.shortBody.length) {
      template.articleStyles.shortBody.length = req.body.articleStyles.shortBody.length;
    }
    if (req.body.articleStyles.shortBody.fontSize) {
      template.articleStyles.shortBody.fontSize = req.body.articleStyles.shortBody.fontSize;
    }
    if (req.body.articleStyles.body.length) {
      template.articleStyles.body.length = req.body.articleStyles.body.length;
    }
    if (req.body.articleStyles.body.fontSize) {
      template.articleStyles.body.fontSize = req.body.articleStyles.body.fontSize;
    }
    if (req.body.articleStyles.title.length) {
      template.articleStyles.title.length = req.body.articleStyles.title.length;
    }
    if (req.body.articleStyles.title.fontSize) {
      template.articleStyles.title.fontSize = req.body.articleStyles.title.fontSize;
    }
    if (req.body.cookieLifeTime) {
      if (req.body.cookieLifeTime < template.cookieLifeTime) {
        User.find().updateMany({ $set: { token : '' }}).exec(function(err){
          if (err) {
            res.json(err);
          } else {
            intel.info('Delete token in all users');
          }
        });
      } 
      template.cookieLifeTime = req.body.cookieLifeTime;
    }
    template.save(function(err) {
      if(err) {
        res.json(err);
        intel.error(err);
      } else {
        res.json(template);
        intel.info('Updated template ', template);
      }
    });
  });
}

// *** delete SINGLE template *** //
function deleteTemplate(req, res) {
  Template.findByIdAndDelete(req.params.id, function(err, template) {
    if(err) {
      res.json(err);
    } else {
        res.json(template);
        intel.info('Deleted template ', template);
      }
  });
}

module.exports = router;