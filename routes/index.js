var express = require('express');
var router = express.Router();
var http = require("../bin/www");
var io = require("socket.io")(http);

var mongoClient = require('mongodb').MongoClient;
// var url = "mongodb://ec2-35-173-232-43.compute-1.amazonaws.com:27017/";
var url = "mongodb://localhost:27017/";

var globalResults;

io.on('connection', function(client) {
  console.log('Client connected...');
});

function mongo(input){
  mongoClient.connect(url, function(err, db){
    if(err) throw err;
    var dbo = db.db("BananaJuice");
    var query = {_id: 0, name: 1, path:1, desc:1, thumbnail:1, comments:1};
    dbo.collection("Videos").find({},{projection: query}).toArray(function(err, results){
      if(err) throw err;
      console.log(results);
      globalResults = results;
      db.close();
    });
  });
}

mongo();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.io.emit("socketToMe", "users");
  res.render('index', { results: globalResults });
});

router.post("/bees",function(req, res){
  res.render("index", {results: globalResults, type: req.body, bee: true});
});

router.get("/bees" , function(req, res){
  console.log(req.query)
  res.render("index", {results: globalResults, type:req.query, bee: true});
});

module.exports = router;
