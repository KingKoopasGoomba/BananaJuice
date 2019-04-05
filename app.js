const createError = require('http-errors');
const express = require('express');
const mongoose = require('mongoose');
const logger = require('morgan');
const configKeys = require('./config/keys');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const upload = require('express-fileupload');
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const Videos = require('./models/Video');

// passport config
require('./lib/passport')(passport);

//connect to mongo
mongoose.connect(configKeys.MongoURI, {useNewUrlParser: true})
    .then(() => console.log("mongobd connected"))
    .catch(err => console.log(err));

function mongoChat(message, id){
  var comment = {comment: message, user: "anonymous", time: Date.now()};
  Videos.findOneAndUpdate({id: id}, {$push: {comments: comment}}, function(err,obj) { 
    console.log(obj); 
  });
}

// function mongoChatOld(message, name){
//   mongoClient.connect("mongodb://localhost:27017/", function(err, db){
//     if(err) throw err;
//     var dbo = db.db("test");
//     var myQuery = {name: name};
//     var newVal = {$push: {comments: {user: "anonymous", comment:message, time:Date.now()}}};
//     dbo.collection("videos").updateOne(myQuery, newVal, function(err, res){
//       if(err) throw err;
//       console.log("Comment added");
//       db.close();
//     });
//   });
// }

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on("disconnect", function(){
    console.log("user disconnected");
  });
  socket.on("chat message", function(msg){
    console.log("Video ID: " + msg.name + "    Message: " + msg.message);
    mongoChat(msg.message, msg.name);
  });
});

// view engine
app.set('view engine', 'pug');
app.use(logger('dev'));

// file upload
app.use(upload());
// Bodyparser
app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname+ '/public'));

//Express session
app.use(session({
  secret: '[dank meme here]',
  resave: true,
  saveUninitialized: true,
 // cookie: { maxAge: 6000 }
}));

//Passport
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());

//global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/',      require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/video', require('./routes/videos'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.io = io;
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = {app:app, server:server};
