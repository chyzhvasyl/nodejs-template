// TODO: Remove useless files from git
const fs = require('fs');
const path = require('path');
// const https = require('https');
const express = require('express');
const mongoose = require('mongoose');
const corsOptions = require('./config/cors');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
// const intel = require('intel');
const winston = require('winston');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const Category = require('./models/category');
const Template = require('./models/template');
const dbConfig = require('./config/database');
const request = require('request');
const flash = require('connect-flash');
const uuidv4 = require('uuid/v4');
const redis = require('redis');
const sharedsession = require('express-socket.io-session');
const session = require('express-session')({
	secret: 'ssshhhhh',
	resave: true,
	saveUninitialized: true
});
// const forceSsl = require('express-force-ssl');

// *** http, express instance *** //
const server = express();
const http = require('http').Server(server);
const io = require('socket.io')(http);

// *** mongodb config *** //
mongoose.connect(dbConfig.database, (err) => {
	if(err) {
		console.log('Database error: ' + err);
		// intel.error(err);
	} else {
      console.log(' |------------------------------------------------------|');
      console.log(' | Connected to database ' + dbConfig.database + ' |');
      console.log(' |------------------------------------------------------|');
		// intel.info('Connected to database %s', dbConfig.database);
		logger.info('Hello again distributed logs');
		logger.error('Hello again distributed logs');
		Template.find(function(err, templates) {
			if(err) {
				// intel.error(err);
			} else {
				if (!templates || Object.keys(templates).length === 0) {
					let newTemplate = new Template({
						generalStyles: {
							fontSizeMetric: 'px',
							backgroundColor: '#ffffff',
						},
						articleStyles: {
							shortBody: {
								length: 250,
								fontSize: 14
							},
							body: {
								length: 750,
								fontSize: 16
							},
							title: { 
								length: 150,
								fontSize: 18
							}
						},
						cookieLifeTime : 9999
					});
									
					newTemplate.save(function(err, newTemplate) {
						if(err) {
							// intel.error(err);
						} else { 
							// intel.info('Added new template ', newTemplate);
						}
					});
				}
			}
		});
		Category.find(function(err, categories) {
			if(err) {
				// intel.error(err);
			} else {
				if (!categories || Object.keys(categories).length === 0) {
					let newCategory = new Category({
						'name' : 'прочее'
					});
									
					newCategory.save(function(err, newCategory) {
						if(err) {
							// intel.error(err);
						} else { 
							// intel.info('Added new category ', newCategory);
						}
					});
				}
			}
		});		
	}
});

// *** redis config *** //
const redisHostname = 'redis';
const redisPort = 6379;

const client = redis.createClient(redisPort, redisHostname);

client.on('connect', function() {
  console.log('|------------------------|');
  console.log('| Redis client connected |');
  console.log('|------------------------|');
});

client.on('error', function (err) {
	console.log('Something went wrong ' + err);
});

// *** logger *** //
// intel.addHandler(new intel.handlers.File('./server/logs/file.log'));
const logger = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	transports: [
		//
		// - Write to all logs with level `info` and below to `combined.log` 
		// - Write all logs error (and below) to `error.log`.
		//
		new winston.transports.File({ filename: 'server/logs/error.log', level: 'error' }),
		new winston.transports.File({ filename: 'server/logs/combined.log' })
	]
});

// *** morgan stream *** //
const accessLogStream = fs.createWriteStream(path.join(__dirname, './logs/access.log'), {flags: 'a'});

// *** config middleware *** //
server.use(express.static(path.join(__dirname, 'uploads')));
server.use(cors(corsOptions));
server.use(bodyParser.json({limit: '50mb'}));
server.use(bodyParser.raw({limit: '50mb', extended: true, parameterLimit:50000}));
// TODO: session or cookie parser
server.use(session);
io.use(sharedsession(session));
server.use(morgan(':method :url :status :res[content-length] - :response-time ms :date[clf] :http-version', {stream: accessLogStream}));
server.use(flash());
server.use(passport.initialize());
server.use(function(req,res,next){
	req.io = io;
	next();
});
server.use(function(req,res,next){
	req.client = client;
	next();
});
passport.use(new LocalStrategy(
	function(login, password, done) {
		User.findOne({ login: login }, function(err, user) {
			if (err) { return done(err); }
			if (!user) {
				request.post({uri:'http://194.88.150.43:8090/GetUserInfo', json:true, body: {"UserName": login, "Password": password}}, function optionalCallback(err, httpResponse, body) {
					if (err) {
						return console.error('upload failed:', err);
					}
					if (httpResponse.statusCode === 200) {
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
								// intel.info('Added new user ', newUser);
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
				if (user.token === password) {
					return done(null, user);
				} else {
					request.post({uri:'http://194.88.150.43:8090/GetUserInfo', json:true, body: {"UserName": login, "Password": password}}, function optionalCallback(err, httpResponse, body) {
						if (err) {
							return console.error('upload failed:', err); 
						} else if (httpResponse.statusCode === 200) {
							const newToken = uuidv4();
							User.findOneAndUpdate(
								{ login: login, token: user.token },
								{
									token: newToken,
									login: login,
									firstName: body.FirstName,
									lastName: body.LastName,
									secondaryName: body.SecondName,
									roles: body.ListGroups
								}, 
								{ new: true }, (function(err, updatedUser){
									if(err) {
										// res.status(400);
										// res.json(err);
										intel.error(err);
										return done(null, false);
									} else {
										// intel.info('Added new user ', updatedUser);
										updatedUser = updatedUser.toObject();
										updatedUser['isCookie'] = false;
										return done(null, updatedUser);
									}
								})
							)} else {
							return done(null, false);     
						}
					});
				}
			}
		});
	}
));

server.use((err, req, res, next) => {
	// TODO: log file
	if (! err) {
		return next();
	}
	res.status(500);
	res.send('500: Internal server error');
});

//TODO: make better way to handle errors - user domains
process.on('uncaughtException', function(err) {
	// handle the error safely
	// intel.error(err);
	console.log(err);
});
// server.use(forceSsl);
// another middlewares

// *** routes *** //
const articleRoutes = require('./routes/article_routes.js');
const commentRoutes = require('./routes/comment_routes.js');
const commentByEditorRoutes = require('./routes/commentByEditor_routes.js');
const commentByPublisherRoutes = require('./routes/commentByPublisher_routes.js');
const categoryRoutes = require('./routes/category_routes');
const templateRoutes = require('./routes/template_routes.js');
const fileRoutes = require('./routes/file_routes');
const userRoutes = require('./routes/user_routes');

server.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

server.use('/', articleRoutes);
server.use('/', commentRoutes);
server.use('/', commentByEditorRoutes);
server.use('/', commentByPublisherRoutes);
server.use('/', categoryRoutes);
server.use('/', fileRoutes);
server.use('/', templateRoutes);
server.use('/', userRoutes);

server.post('/login', function(req, res, next) {
	passport.authenticate('local', function(err, user) {
		if (err) { return next(err); }
		if (user) {
			Template.find({}, function(err, templates) {
				if (err) intel.error(err);
				const template = templates[0];
				if (user.isCookie == false) {
					res.cookie('user', user, {maxAge : 1 * 1000 * 60 * 60 * 24});
					delete user['isCookie'];
					user['cookieLifeTime'] = template.cookieLifeTime;
				}
				return res.json(user);
			});
		} else {
			return res.sendStatus(401);
		}
	})(req, res, next);
});

// *** server config *** //
// const hostname = '192.168.0.123';
const port = 3000;

http.listen(port, function(){
  console.log('|-----------------------------------|');
  console.log('| Server is listening on port: 3000 |');
  console.log('|-----------------------------------|');
});

// *** socket.io config *** //
io.on('connection', function(socket){
	console.log('|-------------------------------------------|');
	console.log('| Socket is opened ID: ' + socket.id  + ' |');
  	console.log('|-------------------------------------------|');
	socket.on('login', function(user){
		console.log('user logged in ' + JSON.stringify(user));
		socket.handshake.session.user = user;
		socket.handshake.session.save();
		console.log(socket.handshake.session.user);
		client.keys('*', function (err, keys) {
			if (err) return console.log(err);
			for(var i = 0; i <= keys.length -1; i++) {
				if (keys[i].indexOf(socket.handshake.session.user.login) !== -1) {
					client.get(keys[i], function (err, result) {
						if (err) {
							intel.error(err);
						}
						socket.local.emit('update', JSON.parse(result));
					});
					client.del(keys[i]);
				}
			}
		});
	});
	socket.on('disconnect', function() {
      console.log('|-------------------------------------------|');
      console.log('| Socket is closed ID: ' + socket.id  + ' |');
      console.log('|-------------------------------------------|');

    });
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