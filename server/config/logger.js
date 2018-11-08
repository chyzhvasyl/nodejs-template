const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(info => {
	return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

const logger = createLogger({
	level: 'info',
	format: combine(
		label({ label: 'Retail News Group' }),
		timestamp(),
		myFormat
	),
	transports: [
		new transports.File({ filename: 'server/logs/error.log', level: 'error' }),
		new transports.File({ filename: 'server/logs/info.log', level: 'info' })
	]
});

module.exports = logger;