const serverless = require('serverless-http');
require('dotenv').config();
const app = require('../app');

module.exports = serverless(app);


