var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var chaosConfig = require('../../config/chaosconfig');
var emailPassport = require('../../model/passportdefinitions/emailpassport.model').EmailPassport;
var helper = require('../../additional-code/helperfunctions');
var ERR_CODE = require('../../error_codes');
var debug = require('debug')('newpass');
var async = require('async');

router.route("/new")

.post(function(req, res, next) {
    var token = req.body.Token;


    async.waterfall([

            function(callback) {
                if (req.body.NewPassword && token) {
                    return callback();
                } else {
                    var errString = "No Password supplied";
                    var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString);
                    debug(errString);
                    return callback(errObject);
                }
            },
            function(callback) {
                jwt.verify(token, chaosConfig.getRecoverySecret(), function(err, decoded) {
                    if (err) {
                        var errString = "Token Expired";
                        var errObject = helper.constructErrorResponse(ERR_CODE.TOKEN_ERROR, errString);
                        debug(errString);
                        return callback(errObject);
                    } else {
                        return callback(null, decoded.UserId);
                    }
                });
            },
            function(UserId, callback) {
                emailPassport.findOne({
                    UserId: UserId
                }, function(err, passport) {
                    if (err) {
                        var errString = "Something bad happened";
                        var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
                        debug(errString);
                        return callback(errObject);
                    }

                    if (!passport) {
                        var errString = "User doesn't exist";
                        var errObject = helper.constructErrorResponse(ERR_CODE.USER_DOESNT_EXIST, errString);
                        debug(errString);
                        return callback(errObject);
                    } else {
                        callback(null, passport);
                    }
                });
            },
            function(passport, callback) {
                passport.Password = req.body.NewPassword;
                passport.save(function(err, pass) {
                    if (err) {
                        var errString = "Passport failed to save";
                        var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
                        debug(errString);
                        return callback(errObject);
                    } else {
                        callback();
                    }
                })
            }
        ],

        function(err, result) {
            var ComposedResponse = helper.ComposeJSONResponse(err);
            var StatusCode = ComposedResponse.code;
            var JSONresponse = ComposedResponse.response;

            if (!err) {
                JSONresponse.Message = "Password has been set";

            }

            res.status(StatusCode).json(JSONresponse);

        });
});

module.exports = router;