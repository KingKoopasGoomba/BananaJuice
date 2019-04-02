const express = require('express');
const router = express.Router();
const fs = require('fs');
const {exec} = require('child_process');

const supportedFormats = require('../config/keys').videoFormats;

const Video = require('../models/Video');
const Category = require('../models/Category');

router.get('/',(req,res)=> res.redirect('/'));

// video page
router.get('/playback/:id',(req,res) =>{

    console.log("here");
    Video.findOne({id: req.params.id})
        .then(video =>{
            if (video) {
                //render video page  if video found
                res.render('video/playback', {video: video})
            } else {
                // flash and display main page if vieo not found
                req.flash('error_msg','Invalid Video Id');
                res.redirect('/');
            }
        })
        .catch()

});

// video raw stream
router.get('/media/:id',(req, res ) => {
    Video.findOne({id: req.params.id})
        .then(video=>{
            const path = video.videoPath;
            const stat = fs.statSync(path);
            const fileSize = stat.size;
            const range = req.headers.range;

            if (range) {
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1]
                    ? parseInt(parts[1], 10)
                    : fileSize-1;

                const chunksize = (end-start)+1;
                const file = fs.createReadStream(path, {start, end});
                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': video.mimeType,
                };

                res.writeHead(206, head);
                file.pipe(res)
            } else {
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': video.mimeType,
                };
                res.writeHead(200, head);
                fs.createReadStream(path).pipe(res);
            }
        })
        .catch(err=>console.log(err))
});

// render video upload page
router.get('/upload',(req, res) =>{
    // check if user is logged in
    if (req.user) {
        Category.find({})
            .then(categories => res.render('video/upload',{categories: categories}))
            .catch(err => console.log(err));
    } else {
        req.flash('error_msg','please login first');
        res.redirect('/users/login')
    }
});

//handle video upload
router.post('/upload',(req,res) =>{
    if (req.user) {
        if (req.files){
            let file = req.files.filename;
            let filename = Date.now();

            // check if received file os of supported format
            if (supportedFormats.includes(req.files.filename.mimetype)) {
                const filePath = './public/videos/' + filename + '.' + req.files.filename.mimetype.split("/")[1];

                file.mv(filePath,  err => {
                    //check for errors
                    if (err) {
                        console.log(err);
                    } else {
                        //process the video here
                        //generate thumbnail
                        exec('ffmpeg -i ' + filePath + ' -vf thumbnail -frames:v 1 public/videos/thumbnails/' + filename +'.jpg ', (err,stdout,stderr) =>{
                            if (err){
                                console.log(err)
                            }
                        });
                        Category.findOne({name: req.body.category})
                            .then(category =>{
                                console.log(category)
                                if (!category){
                                    console.log("adding to categories db " + req.body.category);
                                    new Category({
                                        name: req.body.category
                                    }).save()
                                        .then(category => console.log(category))
                                        .catch(err => console.log(err));
                                }
                            })
                            .catch(err => console.log(err));
                        //add to database
                        Video.countDocuments({}, (err,count) => {

                            //define data to add to db
                            let newVideo = new Video({
                                id: count+1,
                                name: req.body.name,
                                videoPath: filePath,
                                thumbnailPath: '/videos/thumbnails/'+filename+'.jpg',
                                description: req.body.description,
                                category: req.body.category,
                                mimeType: req.files.filename.mimetype,
                                uploader: req.user.name,
                            });

                            newVideo.save()
                            // .then(video => res.redirect('/video/playback/'+video.id))
                            // .then(video => res.redirect("/bees?name=" + video.id + "#album"))
                                .then(video => res.redirect("/bees?id=" + video.id + "#album"))
                                .catch(err => console.log(err))
                        });

                    }
                });
            } else {
                req.flash('error_msg','Unsupported File format');
                res.redirect('/video/upload');
            }
        }


    } else { // if user not logged in
        req.flash('error_msg','please login first');
        res.redirect('/users/login')
    }
});

module.exports = router;

