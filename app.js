
/**
 * Module dependencies.
 */

var config = require('./config');
var express = require('express');
var db = require('./model/db');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || config.app.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, config.static_assets.dir)));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/user/test', user.test);
app.get('/user/:id', user.fetch);
app.post('/user/plantmine', user.plantMine);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
