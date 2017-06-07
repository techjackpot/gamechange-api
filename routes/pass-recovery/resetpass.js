var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
var emailPassport = require('../../model/passportdefinitions/emailpassport.model').EmailPassport;
var chaosConfig = require('../../config/chaosconfig');
var helper = require('../../additional-code/helperfunctions');
var ERR_CODE = require('../../error_codes');
var async = require('async');
var debug = require('debug')('resetpass');

router.route("/reset")
    .post(function(req, res, next) {

        async.waterfall([

                function(callback) {
                    if (req.body.Email) {
                        return callback();
                    } else {
                        var errString = "No Email Supplied";
                        var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString);
                        debug(errString);
                        return callback(errObject);
                    }
                },

                function(callback) {
                    emailPassport.findOne({
                        Email: req.body.Email
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
                            var secret = chaosConfig.getRecoverySecret();

                            jwt.sign({
                                UserId: passport.UserId
                            }, secret, {
                                expiresIn: chaosConfig.getRecoveryTimeout()
                            }, function(err, token) {
                                if (err) {
                                    var errString = "No Email Supplied";
                                    var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
                                    debug(err);
                                    return callback(errObject);
                                } else {

                                    // TODO: Make this resuable. Currently this isn't reusable
                                    var transporter = nodemailer.createTransport(chaosConfig.smtpConfig);
                                    var mailOptions = chaosConfig.getEmailOptions(passport.Email, token, function(err, mailOptions) {
                                        if (err)
                                            return callback("Failed to construct email");

                                        transporter.sendMail(mailOptions, function(err, info) {
                                            if (err) {
                                                console.log("FAILED TO SEND MAIL TO: " + passport.Email);
                                            }
                                        });
                                        callback();
                                    });
                                }
                            });
                        }
                    });
                }
            ],

            function(err, result) {
                var ComposedResponse = helper.ComposeJSONResponse(err);
                var StatusCode = ComposedResponse.code;
                var JSONresponse = ComposedResponse.response;

                if (!err) {
                    JSONresponse.Message = "Password Reset link has been sent";

                }

                res.status(StatusCode).json(JSONresponse);

            });
    });

module.exports = router;