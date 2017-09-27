var express = require('express');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var debug = require('debug')('connect');
var chaosConfig = require('../../config/chaosconfig');
var requireDir = require('require-dir');
var mongoDB = require('../../mongo');
var User = require('../../model/user.model').User;
var PassportsDir = requireDir('../../model/passportdefinitions');
var PassportType = require('../../model/passporttypes/passporttype.model').PassportType;
var router = express.Router();
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var JWT_EXPIRE_TIME = '30m';
var ERR_CODE = require('../../error_codes');
var emailConfirmation = require('../../libs/emailconfirmation');


// TODO MAKE THIS SHIT FASTER
// Ideas: 
// So currently I'm using a lot of async.each then passing it a list and then calling mongoose.find/findone on each object.
// Instead we should use async.each to build a query, then use that query to make one big call to the database. This will make sure 
// we only use 2 queries per signup request.

router.route("/register")
    .post(function(req, res) {
        var response = {};

        var passportsToValidate = [];
        var savedPassports = [];
        var ExistingUser = -1;
        var NewUser = null;
        // TO DO, CREATE A PASSPORT VALIDATION FUNCTION THAT WILL VALIDATE AND PRODUCE ERROR MESSAGES

        var ShouldCreate = true;

        async.waterfall([

                // PASSPORT TYPE VALIDATION STEP
                // Check if type supplied matches type on server. If it doesn't we reject the entire message
                function(nextCallback) {
                    if (!req.body.PassportCollection) {
                        var errString = "No Passport Collection specified";
                        var errObject = helper.constructErrorResponse(ERR_CODE.PASSPORT_FAILED_VALIDATION, errString);
                        debug(errString);
                        nextCallback(errObject);
                    }


                    var passTypeArrLength = mongoDB.PassTypes.length;

                    var passportsDataToValidate = [];

                    for (var i = 0; i < passTypeArrLength; i++) {
                        var passportsCollectionArr = req.body.PassportCollection[mongoDB.PassTypes[i] + "s"];
                        if (passportsCollectionArr) {
                            var passportCollectionlength = passportsCollectionArr.length;
                            for (var j = 0; j < passportCollectionlength; j++) {
                                var passportObj = passportsCollectionArr[j];
                                passportObj.PassportType = mongoDB.PassTypes[i];

                                if (!req.body.PassportCollection)
                                    req.body.PassportCollection = [];

                                passportsDataToValidate.push(passportObj);
                            }
                        }
                    }

                    var length = passportsDataToValidate.length;

                    for (var i = 0; i < length; i++) {
                        var PassType = passportsDataToValidate[i].PassportType;
                        for (var dir in PassportsDir) {
                            if (_.has(PassportsDir[dir], PassType)) {
                                var passportObj = {};

                                passportObj.Passport = new PassportsDir[dir][PassType](passportsDataToValidate[i]);

                                passportObj.Kind = PassType;
                                passportObj.Passport.PassportType = mongoose.Types.ObjectId(mongoDB.PassIDs[PassType]);

                                passportObj.Passport.UserId = -1;

                                passportsToValidate.push(passportObj);
                            }
                        }
                    }

                    console.log(passportsToValidate);

                    if (length != passportsToValidate.length && passportsToValidate.length != 0) {
                        var errString = "Passport Type Validation Failed. Client gave " + length + ", Server could only validate " + passportsToValidate.length;
                        var errObject = helper.constructErrorResponse(ERR_CODE.PASSPORT_DOESNT_EXIST, errString);
                        debug(errString);
                        nextCallback(errObject);
                    } else if (passportsToValidate.length == 0) {
                        var errString = "No Passports Supplied";
                        var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString);
                        debug(errString);
                        nextCallback(errObject);
                    } else {
                        debug("All Passports(" + length + ") type validation succeded");
                        nextCallback();
                    }

                },
                // PASSPORT COLLECTION VALIDATION STEP
                // Check if the Passports exist and do the proper logic based off of the ShouldCreate flag.
                function(nextCallback) {
                    var PassportsThatExist = [];
                    debug("passport to validate: %s", passportsToValidate.length);
                    async.each(passportsToValidate, function(passport, callback) {

                        passport.Passport.DoesPassportExist(function(err, result) {
                            debug("result of DoesPassportExist: %s", result);
                            if (result.length > 0) {
                                PassportsThatExist.push(result[0]);
                            }
                            callback();
                        });
                    }, function(err) {
                        if (err) {
                            var errObject = helper.constructErrorResponse(ERR_CODE.DB_ERROR, "Database Error", 500);
                            nextCallback(errObject);
                        }

                        var PassportConflicts = false;
                        ExistingUser = -1;
                        // Test first ID and compare with the rest.
                        // We expect that all ID's should either be from the same user (login success) or all -1 (new user)
                        var errString = null;
                        debug("passports that exist: %s", PassportsThatExist);
                        for (var i = 1; i < PassportsThatExist.length; i++) {
                            if (PassportsThatExist[0].UserId != PassportsThatExist[i].UserId) {
                                errString = "Passport Conflict: %s conflicts with %s", PassportsThatExist[0].UserId, PassportsThatExist[i].UserId;
                                debug(errString);
                                PassportConflicts = true;
                            }
                        }

                        if (PassportConflicts) {
                            var errObject = helper.constructErrorResponse(ERR_CODE.PASSPORT_CONFLICT, errString);
                            nextCallback(errObject);
                        } else if (PassportsThatExist.length > 0) {
                            ExistingUser = PassportsThatExist[0].UserId;
                        }

                        if (passportsToValidate.length > PassportsThatExist.length && PassportsThatExist.length != 0) {
                            var errString = "Passport Conflict, gave existing passport with new passport";
                            var errObject = helper.constructErrorResponse(ERR_CODE.PASSPORT_CONFLICT, errString);
                            debug(errString);
                            nextCallback(errObject);
                        } else if (ShouldCreate == false && ExistingUser > 0) {
                            var errString = "User already exists";
                            var errObject = helper.constructErrorResponse(ERR_CODE.USER_EXISTS, errString);
                            debug(errString);
                            nextCallback(errObject);
                        } else if (ShouldCreate == false && ExistingUser == -1) {
                            var errString = "User doesn't exist";
                            var errObject = helper.constructErrorResponse(ERR_CODE.USER_DOESNT_EXIST, errString);
                            debug(errString);
                            nextCallback(errObject);
                        } else {
                            nextCallback();
                        }



                    });

                    // PASSPORT SAVE STEP
                    // Save the passports. If we made it this far and it fails, another user probably tried saving at the exact same time.
                },
                function(nextCallback) {

                    debug("passports to validate %s", passportsToValidate);
                    async.each(passportsToValidate, function(passport, callback) {
                        if (ExistingUser != -1) {
                            debug("Authenticating passport");

                            if (passport.Passport.Authenticate === undefined) {
                                var errString = "Passport.Authenticate() does not exist. (Have you added the method to the schema?)";
                                var errObject = helper.constructErrorResponse(ERR_CODE.INTERNAL_PASSPORT_ERROR, errString, 500);
                                debug(errString);
                                callback(errObject);
                            } else {
                                passport.Passport.Authenticate(callback);
                            }


                        } else {
                            debug("Passports are new, we should create them");

                            passport.Passport.save(function(err) {
                                var id = -1;
                                if (err) {
                                    debug(err.errors);

                                    var errString = "Passport Validation failed";
                                    var errObject = helper.constructErrorResponse(ERR_CODE.PASSPORT_FAILED_VALIDATION, errString);
                                    debug(errString);
                                    callback(errObject);
                                } else {
                                    debug("Saving Passport Successful");
                                    savedPassports.push(passport);
                                    callback();
                                }
                            });

                        }

                    }, function(err) {
                        // EdgeCase: In the event that User1: supplies 15 passports and user 2 supplies 1 passport. If the passport conflicts, some passports will still be written to 
                        // the database. We should clean up and delete all the passports we've just made and return with an error.
                        if (err) {
                            var errString = "A passport failed to save/authenticate";
                            var errObject = helper.constructErrorResponse(ERR_CODE.PASSPORT_FAILED_AUTHENTICATION, errString);
                            debug(errString);
                            DeletePassports(savedPassports);
                            nextCallback(errObject);
                        } else {
                            debug('All Passports were saved/authenticated successfully');
                            nextCallback();
                        }
                    });

                    // CREATE USER STEP (Skip user already exists and is being authenticated)
                    // Create User document and add in all the passport IDs to that user.
                },
                function(nextCallback) {
                    if (ExistingUser == -1) {
                        var newUser = new User();
                        newUser.ProfileData = [];
                        newUser.Role = req.body.Role;
                        newUser.DisplayName = req.body.DisplayName;
                        newUser.Name = { First: req.body.Name.First, Last: req.body.Name.Last };
                        newUser.IsConvenor = req.body.IsConvenor;
                        newUser.DisplayPicture = 'avatars/default/man.jpg';
                        newUser.Title = null;
                        newUser.Background = null;
                        newUser.StudentNo = req.body.StatusNo || '';
                        for (var i = 0; i < savedPassports.length; i++) {


                            var PassportObj = {};
                            PassportObj.Passport = savedPassports[i].Passport;
                            PassportObj.Kind = savedPassports[i].Kind;
                            newUser.PassportCollection.push(PassportObj);

                            if (savedPassports[i].Passport.updateProfile)
                                newUser = savedPassports[i].Passport.updateProfile(newUser);
                        }


                        newUser.save(function(err, user) {
                            var id = -1;
                            if (err) {
                                var errString = "Could not create user, dropping previously created passports";
                                var errObject = helper.constructErrorResponse(ERR_CODE.USER_CREATION_FAILED, errString);
                                debug(errString);
                                DeletePassports(savedPassports);
                                nextCallback(errObject);
                            } else {
                                UpdatePassportsWithUserID(savedPassports, user._id, function(err) {
                                    if (err) {
                                        var errObject = helper.constructErrorResponse(ERR_CODE.DB_ERROR, "Database Error", 500);
                                        nextCallback(errObject);
                                    } else {
                                        UpdatePassportsWithSecondaryUserID(savedPassports, user._id, function(err) {
                                            if (err) {
                                                var errObject = helper.constructErrorResponse(ERR_CODE.DB_ERROR, "Database Error", 500);
                                                nextCallback(errObject);
                                            } else {
                                                NewUser = user;
                                                newUser = user;
                                                nextCallback(null, user._id);
                                            }
                                        });

                                    }
                                });



                            }
                        });
                    } else {
                        debug("Skipping User creation as user already exists");
                        var errString = "Could not create user, email already registered";
                        var errObject = helper.constructErrorResponse(ERR_CODE.USER_CREATION_FAILED, errString);
                        debug(errString);
                        nextCallback(errObject);
                    }


                    // PRIMARY USER ID LINK
                },
                function(userID, nextCallback) {

                    if (chaosConfig.getConfirmEmail() === 'true' && NewUser == null) {
                        User
                            .findOne({
                                _id: userID
                            })
                            .exec(function(err, doc) {
                                if (err) {
                                    var errObject = helper.constructErrorResponse("ERR_DATABASE_ERROR", "Database Error", 500);
                                    debug(errObject);
                                    return nextCallback(errObject);
                                }

                                if (doc) {
                                    if (doc.ConfirmedEmail == true) {
                                        return nextCallback(null, userID);
                                    }

                                    var errObject = helper.constructErrorResponse("ERR_NEEDS_ACTIVATION", "User has not confirmed their email", 200);
                                    debug(errObject);
                                    return nextCallback(errObject);
                                }

                                var errObject = helper.constructErrorResponse("ERR_USER_NOT_FOUND", "Tried to confirm user email, user not found", 500);
                                debug(errObject);
                                return nextCallback(errObject);
                            });

                    } else {
                        return nextCallback(null, userID);
                    }
                },
                function(userID, nextCallback) {
                    debug("Logging in with %s", userID);

                    console.log("confirm email:", chaosConfig.getConfirmEmail());
                    console.log("new User", NewUser);

                    if (chaosConfig.getConfirmEmail() === 'true' && NewUser != null) {

                        var welcomeMessage = req.body.WelcomeMessage || "";

                        emailConfirmation.send(NewUser, welcomeMessage, function(err) {
                            if (err) {
                                debug(err);
                            }
                        });

                        var result = {
                            NewUser: true,
                            userID: userID
                        }
                        return nextCallback(null, result);
                    } else {
                        var secret = chaosConfig.getPasswordSecret();

                        jwt.sign({
                            UserId: userID
                        }, secret, {
                            expiresIn: chaosConfig.getExpireTime()
                        }, function(err, token) {
                            if (err || !userID) {
                                console.log(userID);
                                var errObject = helper.constructErrorResponse(ERR_CODE.TOKEN_ERROR, "Failed to sign token", 500);
                                debug("Failed to sign token");
                                nextCallback(errObject);
                            } else {
                                debug("Signed token for %s", userID);
                                var result = {};
                                result.userID = userID;
                                result.token = token;
                                nextCallback(null, result);

                            }
                        });
                    }
                }
            ],

            function(err, result) {
                var ComposedResponse = helper.ComposeJSONResponse(err);
                var StatusCode = ComposedResponse.code;
                var JSONresponse = ComposedResponse.response;

                if (!err) {
                    JSONresponse.ID = result.userID;
                    JSONresponse.Token = result.token;
                    JSONresponse.NewUser = result.NewUser;
                }

                if (JSONresponse.NewUser)
                    JSONresponse.err = "ERR_NEEDS_ACTIVATION";

                res.status(StatusCode).json(JSONresponse);
            });

    });

function DeletePassports(passports) {

    async.each(passports, function(passport, callback) {

        passport.Passport.constructor.remove({
            _id: passport.Passport._id
        }, function(err) {
            if (err) {
                debug("Could not remove a passport. (Cause: One of the set of passports failed to save.");
            }
        });
    });
}

function UpdatePassportsWithUserID(passports, userID, callback) {
    async.each(passports, function(passport, callback) {
        passport.Passport.constructor.findOneAndUpdate({
            _id: passport.Passport._id
        }, {
            $set: {
                UserId: userID
            }
        }, {
            new: true
        }, function(err, doc) {
            if (err) {
                debug("Something wrong when updating user");
                callback(true);
            }
            callback();
        });
    }, callback);

}

function UpdatePassportsWithSecondaryUserID(passports, userID, callback) {
    async.each(passports, function(passport, callback) {
        if (passport.Passport.LinkPassport) {
            passport.Passport.LinkPassport(callback, userID)
        } else {
            debug("No linkPassport found, skipping");
            callback();
        }

    }, callback);

}


module.exports = router;