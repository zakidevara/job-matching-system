const morgan = require('morgan');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

module.exports = logger;

function logger() {

   // Create daily log file
   // const datetime = new Date();
   // const month = (datetime.getMonth() < 9) ? '0' + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
   // const day = (datetime.getDay() < 9) ? '0' + (datetime.getDay() + 1) : datetime.getDay() + 1;
   // const timestamp = month + day + datetime.getFullYear();
   // const logStream = fs.createWriteStream(path.join(__dirname, 'logs', timestamp + '.log'), { flags: 'a' });
   const logStream = fs.createWriteStream(path.join(__dirname, '../logs', 'access.log'), { flags: 'a' });

   // Create custom client IP token - workaround for docker/nginx proxy
   morgan.token('clientaddr', (req, res) => {
       return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
   });

   // Create custom date token with proper timezone infomation - fixes logs so they are not in UTC
   morgan.token('date', (req, res, tz) => {
       return moment().tz(tz).format();
   });

   // Build custom morgan logging format
   morgan.format('myformat', ':clientaddr - :clientaddr [:date[Asia/Jakarta]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"');

   morgan('myformat', { stream: logStream });

   //return next(morgan('myformat', {stream: logStream} ));
   return function log(req, res, next) {
       req.app.use(morgan('myformat', { stream: logStream }));

       return next();
   };
}