const express = require('express');
const router = express.Router();
const Videos = require('../models/Video');
const Categories  = require('../models/Category');
const User = require('../models/User');
//const { ensureAuthenticated } = require('../config/auth');

var globalResults;
var comments;

function mongo(){
    Videos.find({}).then(function(result){
        globalResults = result;
        console.log(result);
    }); 
}

function mongoComment(){
    mongoClient.connect(url, function(err, db){
        if(err) throw err;
        var dbo = db.db("BananaJuice");
        var query = {_id: 0, name: 1, path:1, comments:1};
        dbo.collection("Videos").find({},{projection: query}).toArray(function(err, results){
            if(err) throw err;
            console.log(results);
            comments = results;
            db.close();
        });
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
                    let loggedIn = false;
                    if (req.user) loggedIn= true;
                    res.render('index', {categories: categoriesArr, videos: videos, results: globalResults, type: "", bee: false, loggedin:loggedIn});
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
    mongo();
    Videos.find({})
        .then(videos =>{
            Categories.find({})
                .then(categories => {
                    //create array of strings og categories
                    let categoriesArr = [];
                    categories.forEach(category => categoriesArr.push(category.name));
                    let loggedIn = false;
                    if (req.user) loggedIn= true;
                    res.render('index', {categories: categoriesArr, videos: videos, results: globalResults, type: req.query, bee: true, loggedin:loggedIn});
                })
        });
});

router.get("/messages", (req, res) =>{
    Message.find({}, (err, messages) =>{
        res.send(messages);
    });
});


module.exports = router;
