const express = require('express');
const router = express.Router();
const Img = require('../models/image');
const intel = require('intel');
const fs = require('fs');
const path = require('path');
const UPLOAD_PATH = './server/uploads';

router.get('/image/:id', findImageById);

function findImageById(req, res) {
    let imgId = req.params.id;
    Img.findById(imgId, (err, img) => {
        if (err) {
            res.sendStatus(400);
            res.json(err);
            intel.error(err);
        }
        res.setHeader('Content-Type', img.contentType);
        fs.createReadStream(path.join(UPLOAD_PATH, img.filename)).pipe(res);
    });
}

module.exports = router;