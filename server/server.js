const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const cors = require('cors');
const morgan = require('morgan');
const intel = require('intel');
const forceSsl = require('express-force-ssl');
const dbConfig = require('./config/database');
const corsOptions = require('./config/cors');
var passport      = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
// *** express instance *** //
const server = express();

// *** mongodb config *** //
mongoose.connect(dbConfig.database, (err) => {
    if(err) {
        console.log('Database error: ' + err);
        intel.error(err);
    } else {
        console.log('Connected to database ' + dbConfig.database);
        intel.info('Connected to database %s', dbConfig.database);
    }
});

// *** routes *** //
const articleRoutes = require('./routes/article_routes.js');
const commentRoutes = require('./routes/comment_routes.js');
const categoryRoutes = require('./routes/category_routes');
const templateRoutes = require('./routes/template_routes.js');
const fileRoutes = require('./routes/file_routes');

// *** logger *** //
intel.addHandler(new intel.handlers.File('./server/logs/file.log'));

// *** morgan stream *** //
const accessLogStream = fs.createWriteStream(path.join(__dirname, './logs/access.log'), {flags: 'a'})

// *** config middleware *** //
server.use(express.static(path.join(__dirname, 'uploads')));
server.use(cors(corsOptions));
server.use(bodyParser.json({limit: "50mb"}));
server.use(bodyParser.raw({limit: "50mb", extended: true, parameterLimit:50000}));
server.use(morgan(':method :url :status :res[content-length] - :response-time ms :date[clf] :http-version', {stream: accessLogStream}));
passport.use(new BasicStrategy(
    function(username, password, done) {
      User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.validPassword(password)) { return done(null, false); }
        return done(null, user);
      });
    }
  ));

server.get('/api/me',
  passport.authenticate('basic', { session: false }),
  function(req, res) {
    res.json(req.user);
});  
// server.use(forceSsl);
// enother middlewares
// routes
server.use('/', articleRoutes);
server.use('/', commentRoutes);
server.use('/', categoryRoutes);
server.use('/', fileRoutes);
server.use('/', templateRoutes);

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