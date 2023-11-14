require('dotenv').config({path:__dirname+'/../.env'});
const server = require('./server');
const port = process.env.NODE_PORT || 9000;

server.listen(port);