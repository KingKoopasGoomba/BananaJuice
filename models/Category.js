const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    }
});

const Category = mongoose.model('categories', CategorySchema);

module.exports = Category;