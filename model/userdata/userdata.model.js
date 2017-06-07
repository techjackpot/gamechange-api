var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');
var genericData = require("../data/genericdata.model").GenericData;

var Schema = new mongoose.Schema({
    User: {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
        required: true,
        unique: true,
        index: true
    },
    Data: [genericData]

}, {
        timestamps: true
    });

var model = mongoose.model('ProfileData', Schema, 'ProfileData');

module.exports = {
    UserData: model,
}