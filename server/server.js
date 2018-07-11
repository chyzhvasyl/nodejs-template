const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');   
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const intel = require('intel');
const http = require('http');
const https = require('https');
const forceSsl = require('express-force-ssl');

const dbConfig = require('./config/database');
const corsOptions = require('./config/cors');

// *** logger *** //
intel.addHandler(new intel.handlers.File('./server/logs/file.log'));

// *** routes *** //
const articleRoutes = require('./routes/article_routes.js');
const commentRoutes = require('./routes/comment_routes.js');

// *** mongodb config *** //
mongoose.connect(dbConfig.database, (err, res) => {
    if(err) {
        console.log('Database error: ' + err);
        intel.error("ERROR ", err);
    } else {
        console.log('Connected to database ' + dbConfig.database);
        intel.info('Connected to database %s', dbConfig.database);
    }
});

// *** express instance *** //
const server = express();

// *** morgan stream *** //
const accessLogStream = fs.createWriteStream(path.join(__dirname, './logs/access.log'), {flags: 'a'})

// *** config middleware *** //
server.use(express.static(path.join(__dirname, 'public')));
server.use(express.static(path.join(__dirname, 'uploads')));
server.use(cors(corsOptions));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: false}));
server.use(morgan(':method :url :status :res[content-length] - :response-time ms :date[clf] :http-version', {stream: accessLogStream}));
// server.use(forceSsl);
// enother middlewares

// *** main routes *** //
server.use('/', articleRoutes);
server.use('/', commentRoutes);

// *** server config *** //
const hostname = '192.168.0.123';
const port = 3000; 

server.listen(port, () => {
    console.log(`Server started on port + ${port}`);
    intel.info(`Server started on port , ${port}`);
});

// options = {
//     key: fs.readFileSync('./server/encryption/server.key'),
//     cert: fs.readFileSync('./server/encryption/server.pem'),
//     secureProtocol: 'TLSv1_2_method'
// }

// http.createServer(server).listen(80);

// https.createServer(options, server).listen(port, () => {
//     console.log(`Server started on port ${port}`);
//     intel.info(`Server started on port ${port}`);
// });

module.exports = server;