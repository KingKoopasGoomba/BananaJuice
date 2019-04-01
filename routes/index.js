const express = require('express');
const router = express.Router();
const Videos = require('../models/Video');
const categories = require('../config/keys').videoCategories;
//const { ensureAuthenticated } = require('../config/auth');

/* GET home page. */
router.get('/', (req, res) => {
    Videos.find({})
        .then(videos =>{
            res.render('welcome', {categories: categories, videos: videos})
        })
});

router.get('/dashboard', (req, res) => {
    if (req.user) {
        res.render('user/dashboard', {user: req.user.name})
    } else {
        req.flash('error_msg','please login first');
        res.redirect('/users/login')
    }
});

module.exports = router;
