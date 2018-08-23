const express = require('express');
const router = express.Router();
const File = require('../models/file');
const intel = require('intel');
const fs = require('fs');
const path = require('path');
const UPLOAD_PATH = './server/uploads';

router.get('/files', findAllFiles);
router.get('/file/:id', findFileById);
router.get('/file-small/:id', findFileSmallById);
router.get('/video/:id/:format', findVideoById);
router.get('/screenshot/:id', findScreenshotById);

function findAllFiles(req, res) {
    File.find(function(err, files) {
        if (err) {
            res.sendStatus(400);
            res.json(err);
            intel.error(err);
        }
        res.json(files);
        intel.info("Get all files ", files);
    });
}

function findFileById(req, res) {
    File.findById(req.params.id, (err, file) => {
        if (err) {
            res.sendStatus(400);
            res.json(err);
            intel.error(err);
        }
        res.setHeader('Content-Type', file.contentType);
        fs.createReadStream(path.join(UPLOAD_PATH + '/images/', file.filename)).pipe(res);
    });
}

function findFileSmallById(req, res) {
    File.findById(req.params.id, (err, file) => {
        if (err) {
            res.sendStatus(400);
            res.json(err);
            intel.error(err);
        }
        
        res.setHeader('Content-Type', 'image/png'); 
        const fileName = file.filename.substring(0, file.filename.lastIndexOf('.')) + '.png';
        fs.createReadStream(path.join(UPLOAD_PATH + '/images/', 'small-' + fileName)).pipe(res);
    });
}

function findVideoById(req, res) {
    File.findById(req.params.id, (err, file) => {
        if (err) {
            res.sendStatus(400);
            res.json(err);
            intel.error(err);
        }
        if (req.params.format === 'ogv') {
            res.setHeader('Content-Type', 'video/ogg'); 
        } else if (req.params.format === 'mp4') {
            res.setHeader('Content-Type', 'video/mp4'); 
        } else if (req.params.format === 'webm') {
            res.setHeader('Content-Type', 'video/webm'); 
        }
        fs.createReadStream(path.join(UPLOAD_PATH + '/videos/', 'convert_' + file.filename)).pipe(res);
    });
}

function findScreenshotById(req, res) {
    File.findById(req.params.id, (err, file) => {
        if (err) {
            res.sendStatus(400);
            res.json(err);
            intel.error(err);
        }
        res.setHeader('Content-Type', 'image/png');
        fs.createReadStream(path.join(UPLOAD_PATH + '/videos/', 'screenshot_' + file.filename.substring(0, file.filename.lastIndexOf('.')) + '.png')).pipe(res);
    });
}

module.exports = router;