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

// passport config
require('./lib/passport')(passport);

//connect to mongo
mongoose.connect(configKeys.MongoURI, {useNewUrlParser: true})
    .then(() => console.log("mongobd connected"))
    .catch(err => console.log(err));

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
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
