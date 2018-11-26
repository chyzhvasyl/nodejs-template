// TODO: Remove useless files from git
const fs = require('fs');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const corsOptions = require('./config/cors');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./config/logger');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const Category = require('./models/category');
const Template = require('./models/template');
const dbConfig = require('./config/database');
const request = require('request');
const flash = require('connect-flash');
const uuidv4 = require('uuid/v4');
const sharedsession = require('express-socket.io-session');
const session = require('express-session')({
	secret: 'ssshhhhh',
	resave: true,
	saveUninitialized: true
});
const admin = require('firebase-admin');
const general = require('./config/general');
const compression = require('compression');
// const https = require('https');
// const forceSsl = require('express-force-ssl');

// *** http, express instance *** //
const server = express();
const http = require('http').Server(server);
const io = require('socket.io')(http);

// *** mongodb config *** //
mongoose.connect(dbConfig.database, (err) => {
	if(err) {
		logger.error(err);
	} else {
		console.log(`Connected to database ${dbConfig.database}`);
		logger.info(`Connected to database ${dbConfig.database}`);
		Template.find(function(err, templates) {
			if(err) {
				logger.error(err);
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
						cookieLifeTime : 1
					});
									
					newTemplate.save(function(err) {
						if(err) {
							logger.error(err);
						} else { 
							logger.info('Added new template');
						}
					});
				}
			}
		});
		Category.find(function(err, categories) {
			if(err) {
				logger.error(err);
			} else {
				if (!categories || Object.keys(categories).length === 0) {
					let newCategory = new Category({
						'name' : 'Прочее'
					});
									
					newCategory.save(function(err, newCategory) {
						if(err) {
							logger.error(err);
						} else {
							logger.info(`Added new category ${newCategory.name}`);
						}
					});
				}
			}
		});		
	}
});

// *** redis config *** //
// const redisHostname = 'redis';
// const redisPort = 6379;

// const client = redis.createClient(redisPort, redisHostname);

// client.on('connect', function() {
// 	console.log('Redis client connected');
// });

// client.on('error', function (err) {
// 	console.log('Something went wrong ' + err);
// });

// *** firebase config *** //
const serviceAccount = require('./encryption/rgnews-503a0-firebase-adminsdk-rdlvz-b3349c8815.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://rgnews-503a0.firebaseio.com'
});

const topic = 'highScores';

var payload = {
	data: {
		score: '850',
		time: '2:45'
	}
};

// var registrationToken = 'f2UH6NAW-6U:APA91bHYrUukF5fUbVvt-jWzlBf_18qelYQe2OauITZV5AjLnIaRBo3XmFCFyCWa-n3SjxjjkuJoxQxgDGEXtR2IPsXXCbcW6ZwExlw6i-4qqoc4bGOx6NUNT8j7LMOmPjMyDDDxCQb0';

// admin.messaging().sendToDevice(registrationToken, payload)
// 	.then(function(response) {
// 		// See the MessagingDevicesResponse reference documentation for
// 		// the contents of response.
// 		console.log('Successfully sent message:', response);
// 	})
// 	.catch(function(error) {
// 		console.log('Error sending message:', error);
// 	});

// This registration token comes from the client FCM SDKs.
// var registrationToken = 'f2UH6NAW-6U:APA91bHYrUukF5fUbVvt-jWzlBf_18qelYQe2OauITZV5AjLnIaRBo3XmFCFyCWa-n3SjxjjkuJoxQxgDGEXtR2IPsXXCbcW6ZwExlw6i-4qqoc4bGOx6NUNT8j7LMOmPjMyDDDxCQb0';
//
// // See documentation on defining a message payload.
// var message = {
// 	notification: {
// 		title: 'Тестовое сообщение',
// 		body: 'Тестовое сообщение',
// 	},
// 	android: {
// 		ttl: 3600 * 1000,
// 		notification: {
// 			icon: 'stock_ticker_update',
// 			color: '#f45342',
// 			click_action: 'FCM_PLUGIN_ACTIVITY',
// 			sound: 'default'
// 		}
// 	},
// 	topic: topic,
// };
//
// // Send a message to the device corresponding to the provided
// // registration token.
// admin.messaging().send(message)
// 	.then((response) => {
// 		// Response is a message ID string.
// 		console.log('Successfully sent message:', response);
// 	})
// 	.catch((error) => {
// 		console.log('Error sending message:', error);
// 	});

// *** logger *** //
// intel.addHandler(new intel.handlers.File('./server/logs/file.log'));

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
	req.admin = admin;
	next();
});
server.use(compression());
// server.use(function(req,res,next){
// 	req.client = client;
// 	next();
// });
passport.use(new LocalStrategy(
	function(login, password, done) {
		User.findOne({ login: login.toLowerCase() }, function(err, user) {
			if (err) { return done(err); }
			if (!user) {
				request.post({uri:'http://194.88.150.43:8090/GetUserInfo', json:true, body: {'UserName': login, 'Password': password}}, function optionalCallback(err, httpResponse, body) {
					if (err) {
						return logger.error(err);
					}
					if (httpResponse.statusCode === 200) {
						const newUser = new User({
							token: uuidv4(),
							login: login,
							firstName: body.FirstName,
							lastName: body.LastName,
							secondaryName: body.SecondName,
							roles: body.ListGroups,
							tokenLifeTime: Date.now()
						});
												
						newUser.save(function(err, newUser) {
							if(err) {
								logger.error(err);
								return done(null, false);
							} else {
								logger.info(`Added new user ${newUser.login}`);
								return done(null, newUser);
							}
						});
					} else {
						return done(null, false);
					}
				});
			} else {
				Template.find({}, function(err, templates) {
					if (err) {
						logger.error(err);
					}
					const template = templates[0];
					if (user.token === password) {
						if ((Date.now() - user.tokenRefreshTime) < general.tokenLifeTime * template.cookieLifeTime) {
							return done(null, user);
						} else {
							return done(null, false);
						}
					} else {
						if ((Date.now() - user.tokenRefreshTime) < general.tokenLifeTime * template.cookieLifeTime) {
							return done(null, user);
						} else {
							request.post({uri:'http://194.88.150.43:8090/GetUserInfo', json:true, body: {'UserName': login, 'Password': password}}, function optionalCallback(err, httpResponse, body) {
								if (err) {
									return logger.error(err); 
								}
								const newToken = uuidv4();
								if (httpResponse.statusCode === 200) {
									User.findOneAndUpdate(
										{ login: login, token: user.token },
										{
											token: newToken,
											tokenRefreshTime: Date.now(),
											roles: body.ListGroups
										}, 
										{ new: true }, (function(err, updatedUser){
											if(err) {
												logger.error(err);
												return done(null, false);
											} else {
												logger.info(`Updated user ${updatedUser.login}`);
												return done(null, updatedUser);
											}
										})
									);
								} else {
									return done(null, false);     
								}
							});
						}
					}
				});
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
		if (err) { 
			return next(err);
		}
		if (user) {
			return res.json(user);
		} else {
			return res.sendStatus(401);
		}
	})(req, res, next);
});

// *** server config *** //
// const hostname = '192.168.122.1';
const port = 3000;

http.listen(port, function(){
	console.log('Server started on port: 3000');
	logger.info(`Server started on port: ${port}`);
});

// *** socket.io config *** //
io.on('connection', function(socket){
	console.log('Socket is opened ID: ' + socket.id);
	socket.on('login', function(user){
		console.log('user logged in ' + JSON.stringify(user));
		socket.handshake.session.user = user;
		socket.handshake.session.save();
		// console.log(socket.handshake.session.user);
		// client.keys('*', function (err, keys) {
		// 	if (err) return console.log(err);
		// 	for(var i = 0; i <= keys.length -1; i++) {
		// 		if (keys[i].indexOf(socket.handshake.session.user.login) !== -1) {
		// 			client.get(keys[i], function (err, result) {
		// 				if (err) {
		// 					// intel.error(err);
		// 				}
		// 				socket.local.emit('update', JSON.parse(result));
		// 			});
		// 			client.del(keys[i]);
		// 		}
		// 	}
		// });
	});
	socket.on('disconnect', function() {
		console.log('| Socket is closed ID: ' + socket.id);
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