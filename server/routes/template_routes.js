const express = require('express');
const router = express.Router();
const Template = require('../models/template');
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
      body: {
        fontSize: req.body.articleStyles.body.fontSize,
        bgColor: req.body.articleStyles.body.bgColor
      },
      title: { 
        fontSize: req.body.articleStyles.title.fontSize,
        bgColor: req.body.articleStyles.title.bgColor
      }
    }
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
    if (req.body.articleStyles.body.fontSize) {
      template.articleStyles.body.fontSize = req.body.articleStyles.body.bgColor;
    }
    if (req.body.articleStyles.body.bgColor) {
      template.articleStyles.body.bgColor = req.body.articleStyles.body.bgColor;
    }
    if (req.body.articleStyles.title.fontSize) {
      template.articleStyles.title.fontSize = req.body.articleStyles.body.bgColor;
    }
    if (req.body.articleStyles.title.bgColor) {
      template.articleStyles.title.bgColor = req.body.articleStyles.body.bgColor;
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