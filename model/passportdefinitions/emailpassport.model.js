var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');
var ModelEncrypt = require('../../additional-code/modelbencrypt');
var bcrypt = require('bcrypt-nodejs');
var schemaTypes = require("../../libs/schematypes");
var ModelName = 'EmailPassport';

var Schema = new mongoose.Schema({
    PassportType: {
        type: mongoose.Schema.ObjectId,
        ref: 'PassportType'
    },
    UserId: {
        type: String,
        required: true
    },
    Email: schemaTypes.emailSchemaRequired,
    Password: schemaTypes.passwordSchema,
});

Schema.methods.updateProfile = function (user) {
    user.Email = this.Email;

    return user;
}

Schema.methods.DoesPassportExist = function(callback) {

    return this.model(ModelName).find({
        Email: this.Email
    }, '_id UserId', function(err, result) {
        callback(err, result);
    }).limit(1);
}

Schema.methods.Authenticate = function(callback) {

    var PassportToAuthenticate = this;
    return this.model(ModelName).findOne({
        Email: PassportToAuthenticate.Email
    }, function(err, result) {
        if (err) {
            callback(err);
        } else {
            result.ComparePassword(PassportToAuthenticate.Password, function(err, isMatch) {
                if (err) {
                    callback(err);
                } else if (isMatch) {
                    callback();
                } else {
                    callback("Password is incorrect");
                }
            });
        }
    }).limit(1);
}


Schema.methods.ComparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.Password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

// Implemented from http://blog.mongodb.org/post/32866457221/password-authentication-with-mongoose-part-1 & http://stackoverflow.com/questions/14588032/mongoose-password-hashing
Schema.pre('save', function(next) {
    var object = this;
    ModelEncrypt.ModelEncrypt(object, 'Password', next);

});

//Allows for custom error messages as well. Will need to implement.
//userSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' }); 

Schema.plugin(uniqueValidator);

var schema = mongoose.model(ModelName, Schema, 'EmailPassports');

module.exports = {
    EmailPassport: schema
}