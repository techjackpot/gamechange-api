var mongoose = require("mongoose");
var jwt = require('jsonwebtoken');
var chaosConfig = require('../../config/chaosconfig');
var uniqueValidator = require('mongoose-unique-validator');
var ModelEncrypt = require('../../additional-code/modelbencrypt');
var debug = require('debug')('UserTokenPassport');
var User = require('../../model/user.model').User;
var async = require('async');

var ModelName = 'UserTokenPassport';

var Schema = new mongoose.Schema({
    PassportType: {
        type: mongoose.Schema.ObjectId,
        ref: 'PassportType'
    },
    UserId: {
        type: String,
        required: true
    },
    Username: {
        type: String,
        required: true,
        unique: true
    },
    ParentId: {
        type: mongoose.Schema.ObjectId,
        ref: "Users",
        required: true
    },
    ParentToken: {
        type: String
    }
});

Schema.methods.DoesPassportExist = function(callback) {

    return this.model(ModelName).find({
        Username: this.Username
    }, '_id UserId', function(err, result) {
        callback(err, result);
    }).limit(1);
}

Schema.methods.Authenticate = function(callback) {

    var PassportToAuthenticate = this;

    VerifyTokenIsValid(PassportToAuthenticate, callback);
}

Schema.pre('validate', function(next) {
    var PassportToAuthenticate = this;

    VerifyTokenIsValid(PassportToAuthenticate, function(err) {
        if (err) {
            next(new Error(err))
        } else {
            next();
        }

    });

});

Schema.pre('save', function(next) {
    debug("attempting to save usertoken passport");
    this.ParentToken = "";
    next();
});

Schema.methods.LinkPassport = function(callback, UserID) {

    var PassportToAuthenticate = this;

    User.findOneAndUpdate({
            _id: PassportToAuthenticate.ParentId
        }, {
            $addToSet: {
                "SecondaryUsers": UserID
            }
        },
        function(err) {
            if (err) {
                var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, "Something went wrong when updating user with secondary ID", 500);
                debug("Failed to link secondary user with primary user");
                callback(errObject);
            } else {
                callback();
            }
        });
}


function VerifyTokenIsValid(PassportToAuthenticate, callback) {
    jwt.verify(PassportToAuthenticate.ParentToken, chaosConfig.getPasswordSecret(), function(err, decoded) {
        if (err) {
            debug("Failed to verify token");
            callback("Failed to verify token");
        } else {
            if (decoded.UserId == PassportToAuthenticate.ParentId) {
                debug("Validation: tokens matched");
                callback();
            } else {
                debug("ID did not match with token ID");
                callback("ID did not amtch with token ID");
            }
        }
    });
}
//Allows for custom error messages as well. Will need to implement.
//userSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' }); 

Schema.plugin(uniqueValidator);

var schema = mongoose.model(ModelName, Schema, 'UserTokenPassports');
module.exports = {
    UserTokenPassport: schema
}