var express = require('express');
var debug = require('debug')('app');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var async = require('async');
var mongoose = require("mongoose");
var mongoDB = require("./mongo");
var fileUpload = require('express-fileupload');
var PORT = 8080;
var fs = require('fs');
var https = require('https');
var http = require('http');
var express = require('express');

/*

var keys_dir = 'keys/';

var server_options = {
  key: fs.readFileSync(keys_dir + 'ChaosCloud-key-dev.pem'),
  //ca   : fs.readFileSync(keys_dir + 'certauthority.pem'),
  cert: fs.readFileSync(keys_dir + 'ChaosCloud-cert-dev.pem')
}

*/


var routes = require('./routes/index');

var user_connect = require('./routes/authentication/connect');
var user_login = require('./routes/authentication/login');
var user_register = require('./routes/authentication/register');
var tokenVerification = require('./routes/authentication/verifytoken');
var user = require('./routes/user');
var classes = require('./routes/classes');
var games = require('./routes/games');
var groups = require('./routes/groups');
var students = require('./routes/students');
var tasks = require('./routes/tasks');
var cards = require('./routes/cards');
var marks = require('./routes/marks');
var marketplace = require('./routes/marketplace');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.enable('trust proxy');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb'}));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(fileUpload());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), {
  redirect: false
}));
app.use('/static', express.static('public'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, enctype, Accept, x-chaos-token");
  next();
});

// TODO CREATE INDEX.JS RESPONSIBLE FOR DOING THE APP.USES IN EACH ROUTE FOLDER.
// TODO: MAKE A ROUTES.JS AND PUT ALL THIS CRAP IN IT
app.use('/', routes);

app.use('/api', user_connect);
app.use('/api', user_login);
app.use('/api', user_register);
app.use('/api/user', tokenVerification);
app.use('/api/user', user);
app.use('/api/user/classes', classes);
app.use('/api/classes/groups', groups);
app.use('/api/students', students);
app.use('/api/tasks', tasks);
app.use('/api/games', games);
app.use('/api/cards', tokenVerification);
app.use('/api/cards', cards);
app.use('/api/marks', marks);
app.use('/api/marketplace', marketplace);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var ServerReady = false;

// TODO fix this, it connects like 3 times then is fine.

var ServerCreated = false;

async.whilst(
  function() {
    return ServerReady == false;
  },
  function(callback) {
    if (mongoose.connection.readyState != 1 && mongoose.connection.readyState != 2 && ServerReady == false) {
      mongoDB.init(function(err) {

        if (!err) {
          ServerReady = true;
          debug("MongoDB Connected~");
        }

        setTimeout(function() {
          callback();
        }, 5000);


      });
    }
  },
  function(err, n) {
    if (err) throw err;

    if (ServerCreated == false) {
      ServerCreated = true;
      //https.createServer(server_options, app).listen(443); //server https
      http.createServer(app).listen(3001);
      debug("Ready");

    }
  }
);


module.exports = app;
