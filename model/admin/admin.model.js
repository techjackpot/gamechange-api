var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');
var ModelEncrypt = require('../../additional-code/modelbencrypt');
var bcrypt = require('bcrypt-nodejs');

var Schema = new mongoose.Schema({
    Username: {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

Schema.pre('save', function(next) {
    var object = this;
    ModelEncrypt.ModelEncrypt(object, 'Password', next);

});

Schema.methods.ComparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.Password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

var schema = mongoose.model('Admin', Schema, 'Admins');

module.exports = {
    Admin: schema
}