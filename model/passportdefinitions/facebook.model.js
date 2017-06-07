var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');
var ModelEncrypt = require('../../additional-code/modelbencrypt');
var bcrypt = require('bcrypt-nodejs');

var Schema = new mongoose.Schema({
    UserId: {
        type: String,
        required: true
    },
    FacebookID: {
        type: String,
        required: true,
        unique: true
    }
});

Schema.methods.DoesPassportExist = function(callback) {

    return this.model('FacebookPassport').find({
        FacebookID: this.FacebookID
    }, '_id UserId', function(err, result) {
        callback(err, result);
    }).limit(1);
}

Schema.methods.Authenticate = function(callback) {

    callback();
}


// Implemented from http://blog.mongodb.org/post/32866457221/password-authentication-with-mongoose-part-1 & http://stackoverflow.com/questions/14588032/mongoose-password-hashing
/*Schema.pre('save', function(next) {
    var object = this;
    ModelEncrypt.ModelEncrypt(object, 'Password', next);

});*/

//Allows for custom error messages as well. Will need to implement.
//userSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' }); 

Schema.plugin(uniqueValidator);

var schema = mongoose.model('FacebookPassport', Schema, 'FacebookPassports');

module.exports = {
    FacebookPassport: schema
}