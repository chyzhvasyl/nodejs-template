const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const dbConfig = require('./config/database');
const corsOptions = require('./config/cors');
const fs = require('fs');
const path = require('path');
const intel = require('intel');

// *** logger *** //
intel.addHandler(new intel.handlers.File('./server/logs/file.log'));

// *** routes *** //
const routes = require('./routes/note_routes.js');

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
server.use(express.static(path.join(__dirname, 'public')))
server.use(cors(corsOptions));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: false}));
server.use(morgan(':method :url :status :res[content-length] - :response-time ms :date[clf] :http-version', {stream: accessLogStream}));
// остальные слои

// *** main routes *** //
server.use('/', routes);

// *** server config *** //
const port = 3000; 

server.listen(port, () => {
    console.log('Server started on port ' + port);
    intel.info('Server started on port ', port);
});

module.exports = server;