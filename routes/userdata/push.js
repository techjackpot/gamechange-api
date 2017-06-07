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
router.route("/push")

    .post(function (req, res, next) {
        async.waterfall([
            function (callback) { 
                if (req.body.Data === undefined || req.body.Data.length == 0) {
                    return callback("No data supplied");
                }

                return callback();
            },
            function (callback) {
                userData
                    .findOne({ User: req.decoded.UserId })
                    .exec(function (err, doc) {
                        if (err)
                            return callback(err);

                        if (!doc) {
                            doc = new userData(); 
                            doc.User = req.decoded.UserId;
                        }



                        for(var i = 0; i < doc.Data.length; ++i) {
                            for(var j = req.body.Data.length - 1; j >= 0; j--) {
                                if (doc.Data[i].DataType == req.body.Data[j].DataType) {
                                    doc.Data[i].Data = req.body.Data[j].Data;

                                    req.body.Data.splice(j, 1);
                                }
                            }
                        }

                        for(var i = 0; i < req.body.Data.length; ++i) {
                            doc.Data.push(req.body.Data[i]);
                        }
                        

                        doc.save(function (err, doc) {
                            if (err)
                                return callback(err);

                            return callback();
                        });
                    });
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