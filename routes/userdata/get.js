var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var user = require('../../model/user.model').User;
var userData = require('../../model/userdata/userdata.model').UserData;
var router = express.Router();
var debug = require('debug')('getuser');
var ERR_CODE = require('../../error_codes');
var userCommon = require('../../libs/user/usercommon');

// Rewrite this to use aggregates next pass over
router.route("/get")

    .post(function (req, res, next) {
        async.waterfall([
            function (callback) {
                userData.findOne({ User: req.decoded.UserId })
                    .exec(function (err, doc) {
                        if (err)
                            return callback(err);

                        if (doc)
                            return callback(null, doc);

                        var newUserData = new userData();
                        newUserData.User = req.decoded.UserId;
                        newUserData.save(function (err, doc) {
                            if (err)
                                return callback(err);

                            return callback(null, doc);
                        });
                    });

            }, function (profile, callback) {
                if (req.body.Keys === undefined || req.body.Keys.length == 0) {
                    return callback(null, profile.Data);
                } else {
                    var data = [];
                    for (var i = 0; i < profile.Data.length; i++) {
                        if (req.body.Keys.indexOf(profile.Data[i].DataType) > -1) {
                            data.push(profile.Data[i]);
                        }
                    }

                    return callback(null, data);
                }
            }
        ],
            function (err, result) {
                var ComposedResponse = helper.ComposeJSONResponse(err);
                var StatusCode = ComposedResponse.code;
                var JSONresponse = ComposedResponse.response;

                JSONresponse.err = err;
                if (!err) {
                    JSONresponse.Data = result;
                }

                res.status(StatusCode).json(JSONresponse);

                //helper.SendStandardJSON(res, err, result);
            });
    });

module.exports = router;