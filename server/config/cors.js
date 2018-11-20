const corsOptions = {
	origin: ['http://localhost:8100', 'http://localhost:8080', 'http://localhost:8000'],
	optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
	credentials: true
};

module.exports = corsOptions;