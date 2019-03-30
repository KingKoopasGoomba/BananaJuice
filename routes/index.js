var express = require('express');
var router = express.Router();

var mongoClient = require('mongodb').MongoClient;
var url = "mongodb://ec2-35-173-232-43.compute-1.amazonaws.com:27017/";

var globalResults;

mongoClient.connect(url, function(err, db){
  if(err) throw err;
  var dbo = db.db("BananaJuice");
  var query = {_id: 0, name: 1, path:1, desc:1, thumbnail:1};
  dbo.collection("Videos").find({},{projection: query}).toArray(function(err, result){
    if(err) throw err;
    globalResults = result;
    db.close();
  });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { result: globalResults });
});

router.post("/bees",function(req, res){
  res.render("index", {result: globalResults, type: req.body, bee: true});
});

router.get("/bees#video" , function(req, res){
  res.render("index", {result: globalResults, type:req.query, bee: true});
});

module.exports = router;
