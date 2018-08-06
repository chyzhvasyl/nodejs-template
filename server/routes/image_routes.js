const express = require('express');
const router = express.Router();
const Img = require('../models/image');
const intel = require('intel');
const fs = require('fs');
const path = require('path');
const UPLOAD_PATH = './server/uploads';

router.get('/images', findAllImages);
router.get('/image/:id', findImageById);
router.get('/image-small/:id', findImageSmallById);

function findAllImages(req, res) {
    Img.find(function(err, images) {
        if (err) {
            res.sendStatus(400);
            res.json(err);
            intel.error(err);
        }
        res.json(images);
        intel.info("Get all images ", images);
    });
}

function findImageById(req, res) {
    Img.findById(req.params.id, (err, img) => {
        if (err) {
            res.sendStatus(400);
            res.json(err);
            intel.error(err);
        }
        res.setHeader('Content-Type', img.contentType);
        fs.createReadStream(path.join(UPLOAD_PATH, img.filename)).pipe(res);
    });
}

function findImageSmallById(req, res) {
    Img.findById(req.params.id, (err, img) => {
        if (err) {
            res.sendStatus(400);
            res.json(err);
            intel.error(err);
        }
        res.setHeader('Content-Type', img.contentType); 
        fs.createReadStream(path.join(UPLOAD_PATH, 'small-' + img.filename)).pipe(res);
    });
}

module.exports = router;