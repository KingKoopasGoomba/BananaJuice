const express = require('express');
const router = express.Router();
const Videos = require('../models/Video');
const categories = require('../config/keys').videoCategories;
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
            res.render('index', {categories: categories, videos: videos, results: globalResults, type: "", bee: false});
        });
});

router.get('/dashboard', (req, res) => {
    if (req.user) {
        res.render('user/dashboard', {user: req.user.name})
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
