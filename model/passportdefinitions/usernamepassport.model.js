var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');
var ModelEncrypt = require('../../additional-code/modelbencrypt');
var bcrypt = require('bcrypt-nodejs');

var ModelName = 'UsernamePassport';

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
    Password: {
        type: String,
        required: true
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
    return this.model(ModelName).findOne({
        Username: PassportToAuthenticate.Username
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

var schema = mongoose.model(ModelName, Schema, 'UsernamePassports');
module.exports = {
    UsernamePassport: schema
}


/* TEST FOR THE HASHING

// create a user a new user
var testUser = new User({
    username: 'jmar777',
    password: 'Password123';
});

// save user to database
testUser.save(function(err) {
    if (err) throw err;
});

// fetch user and test password verification
User.findOne({ username: 'jmar777' }, function(err, user) {
    if (err) throw err;

    // test a matching password
    user.comparePassword('Password123', function(err, isMatch) {
        if (err) throw err;
        debug('Password123:', isMatch); // -&gt; Password123: true
    });

    // test a failing password
    user.comparePassword('123Password', function(err, isMatch) {
        if (err) throw err;
        debug('123Password:', isMatch); // -&gt; 123Password: false
    });
});

*/