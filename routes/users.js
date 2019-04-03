const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const passport = require('passport');
const Categories= require('../models/Category');
// login page
router.get('/login', (req, res, next) => {
  if (req.user) {
    res.redirect('/dashboard');
    return;
  }
  res.render('user/login');
});

//Login handle
router.post('/login',(req, res, next) => {
  if (req.user) {
    res.redirect('/dashboard');
    return;
  }
  passport.authenticate('local',{
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)
});

//logout handle
router.get('/logout',(req, res, next) => {
  req.logout();
  req.flash('success_msg','Logged out');
  res.redirect('/users/login');
});

// subscribe to users categories
router.post('/subscribe', (req, res, next) => {
  if (!req.user) {
    req.flash('error_msg','Please log in first');
    res.redirect('/users/login');
    return;
  }
  User.findOneAndUpdate({email:req.user.email},{subscribedCategories: req.body.categories})
      .then(user => {
        res.redirect('/dashboard');
      })

});

router.get('/subscribe',(req,res, next) => {
  if (!req.user) {
    res.redirect('/dashboard');
    return;
  }
  Categories.find({})
      .then(categories => {
        console.log('here');
        //create array of strings og categories
        let categoriesArr = [];
        categories.forEach(category => categoriesArr.push(category.name));
        res.render('user/subscribe', {categories: categoriesArr});
      })
});
// register page
router.get('/register', (req, res, next) => {
  if (req.user) {
    res.redirect('/dashboard');
    return;
  }
  res.render('user/register');
});

//register handle
router.post('/register', (req, res, next) =>{
  if (req.user) {
    res.redirect('/dashboard');
    return;
  }
  const {name, email, password, password2 } = req.body;
  let errors = [];

  //check all fields filled
  if (!name || !email || !password || !password2){
    errors.push("Pls fill in all fields\n")
  }

  //check if passwords are the same
  if (password !== password2){
    errors.push("passwords do not match\n");
  }

  //check password lenght
  if (password.length < 5){
    errors.push("password is too short\n")
  }

  if (errors.length > 0) {
    res.render('user/register', {
      errors,
      name,
      email
    })
  } else {

    let newUser = new User({
      name,
      email,
      password
    });

    console.log(newUser);

    User.findOne({email: email})
        .then(user => {
          if (user) {
            errors.push("User already with that email exists");
            res.render('user/register', {
              errors,
              name,
              email
            });
            return
          }

          //Hash password
          //generate salt
          bcrypt.genSalt(10,(err, salt) => {
            if (err) throw err;
            //hash password
            bcrypt.hash(newUser.password, salt,(err, hash)=>{
              if (err) throw err;
              newUser.password = hash;
              console.log(newUser);

              newUser.save()
                  .then(user => {
                    req.flash('success_msg','You are now registered');
                    res.redirect('/users/login')
                  })
                  .catch(err => console.log(err));
            })
          });
        })
        .catch(err => console.log(err))
    }
});


module.exports = router;
