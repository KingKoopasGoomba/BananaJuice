const express = require('express');
const router = express.Router();
const Videos = require('../models/Video');
const Categories  = require('../models/Category');
const User = require('../models/User');
//const { ensureAuthenticated } = require('../config/auth');

var globalResults;

function mongo(){
    Videos.find({}).then(function(result){
        globalResults = result;
        console.log(result);
    }); 
}
mongo();

/* GET home page. */
router.get('/', (req, res) => {
    Videos.find({})
        .then(videos =>{
            Categories.find({})
                .then(categories => {
                    //create array of strings og categories
                    let categoriesArr = [];
                    categories.forEach(category => categoriesArr.push(category.name));
                    res.render('index', {categories: categoriesArr, videos: videos, results: globalResults, type: "", bee: false});
                })
        });
});

router.get('/dashboard', (req, res) => {
    if (req.user) {
    Videos.find({})
        .then(videos => {
            User.findOne({email: req.user.email})
                .then(user => {
                    res.render('user/dashboard', {categories: user.subscribedCategories, results: videos});
                });
        });
    } else {
        req.flash('error_msg','please login first');
        res.redirect('/users/login');
    }
});

router.get("/bees", function(req, res){
    console.log(req.query);
    mongo();
    console.log("@@@@@@@@@@@@@@@''");
    console.log(req.query);
    res.render("index", {results: globalResults, type:req.query, bee: true});
});

router.get("/messages", (req, res) =>{
    Message.find({}, (err, messages) =>{
        res.send(messages);
    });
});


module.exports = router;
