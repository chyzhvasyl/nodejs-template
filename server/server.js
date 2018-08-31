// TODO: change tabulation to 2
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
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const request = require('request');
const User = require('./models/user');
const flash = require('connect-flash');
const session = require('express-session');
const uuidv4 = require('uuid/v4');
const Template = require('./models/template');

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

// *** logger *** //
intel.addHandler(new intel.handlers.File('./server/logs/file.log'));

// *** morgan stream *** //
const accessLogStream = fs.createWriteStream(path.join(__dirname, './logs/access.log'), {flags: 'a'})

// *** config middleware *** //
server.use(express.static(path.join(__dirname, 'uploads')));
server.use(cors(corsOptions));
server.use(bodyParser.json({limit: "50mb"}));
server.use(bodyParser.raw({limit: "50mb", extended: true, parameterLimit:50000}));
// TODO: session or cookie parser
// server.use(session({ cookie: { maxAge: 60000 }, 
//     secret: 'woot',
//     resave: false, 
//     saveUninitialized: false}));
server.use(morgan(':method :url :status :res[content-length] - :response-time ms :date[clf] :http-version', {stream: accessLogStream}));
server.use(flash());
server.use(passport.initialize());
// server.use(passport.session());
passport.use(new LocalStrategy(
    function(login, password, done) {
      // TODO: первый заход и последующие ищет по token(а летит пароль)
      User.findOne({ login: login, token: password }, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
            request.post({uri:'http://194.88.150.43:8090/GetUserInfo', json:true, body: {"UserName": login, "Password": password}}, function optionalCallback(err, httpResponse, body) {
                if (err) {
                    return console.error('upload failed:', err);
                }
                if (httpResponse.statusCode == 200) {
                    const newUser = new User({
                        // TODO: token live time
                        token: uuidv4(),
                        login: login,
                        firstName: body.FirstName,
                        lastName: body.LastName,
                        secondaryName: body.SecondName,
                        roles: body.ListGroups
                    });
                        
                    newUser.save(function(err, newUser) {
                        if(err) {
                            // res.status(400);
                            // res.json(err);
                            intel.error(err);
                            return done(null, false);
                        } else {
                            intel.info('Added new user ', newUser);
                            newUser = newUser.toObject();
                            newUser['isCookie'] = false;
                            return done(null, newUser);
                        }
                    });
                   
                } else {
                    return done(null, false);     
                }
            });
        } else {
            return done(null, user);
        }
      });
    }
));
// server.use(forceSsl);
// another middlewares

// *** routes *** //
const articleRoutes = require('./routes/article_routes.js');
const commentRoutes = require('./routes/comment_routes.js');
const categoryRoutes = require('./routes/category_routes');
const templateRoutes = require('./routes/template_routes.js');
const fileRoutes = require('./routes/file_routes');
const userRoutes = require('./routes/user_routes');

server.use('/', articleRoutes);
server.use('/', commentRoutes);
server.use('/', categoryRoutes);
server.use('/', fileRoutes);
server.use('/', templateRoutes);
server.use('/', userRoutes);

server.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (user) {
          Template.find({}, function(err, templates) {
            if (err) intel.error(err);
            const template = templates[0];
            if (user.isCookie == false) {
                res.cookie('user', user, {maxAge : template.cookieLifeTime * 1000 * 60 * 60 * 24}); 
                delete user['isCookie'];
                user['cookieLifeTime'] = template.cookieLifeTime;
            }
            return res.json(user);
            
          })
        } else {
            return res.sendStatus(401);
        }
    })(req, res, next);
});

// *** server config *** //
const hostname = '192.168.0.123';
const port = 3000; 

server.listen(port, () => {
    console.log(`Server started on port + ${port}`);
    intel.info(`Server started on port , ${port}`);
});

//TODO: https
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