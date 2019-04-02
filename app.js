var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

function mongo(input){
  mongoClient.connect(url, function(err, db){
    if(err) throw err;
    var dbo = db.db("BananaJuice");
    var myQuery = {name: "juice"};
    var newVal = {$push: {comments: {user: "anonymous", comment:input, time:Date.now()}}};
    dbo.collection("Videos").updateOne(myQuery, newVal, function(err, res){
      if(err) throw err;
      console.log("Comment added");
      db.close();
    });
  });
}

var indexRouter = require('./routes/index');

var app = express();

var server = require("http").Server(app);
var io = require("socket.io")(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on("disconnect", function(){
    console.log("user disconnected");
  });
  socket.on("chat message", function(msg){
    console.log("From: " + msg.name + "    Message: " + msg.message);
    mongo(msg.message);
  });
});

app.use(function(req, res, next){
  res.io = io;
  next();
});

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = {app: app, server: server};