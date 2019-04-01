const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
    id:{
        type: Number,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    videoPath:{
        type: String,
        required: true
    },
    thumbnailPath:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: false
    },
    category:{
        type: String,
        required: false
    },
    mimeType:{
        type: String,
        required: true
    },
    uploader:{
      type: String,
      required: true
    },

});

const Video = mongoose.model('Video',VideoSchema);

module.exports = Video;