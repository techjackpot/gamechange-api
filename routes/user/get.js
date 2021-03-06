var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var user = require('../../model/user.model').User;
var router = express.Router();
var debug = require('debug')('getuser');
var ERR_CODE = require('../../error_codes');
var userCommon = require('../../libs/user/usercommon');

router.route("/get")

.post(function(req, res, next) {
	async.waterfall([

			function(callback) {
                userCommon.getUser(req.decoded.UserId, req.body.UserID, function (err, user) {
                    if (err) {
                        return callback(err)
                    }

                    callback(null, user);
                });	
			}
		],
		function(err, result) {
			var ComposedResponse = helper.ComposeJSONResponse(err);
			var StatusCode = ComposedResponse.code;
            var JSONresponse = ComposedResponse.response;

            JSONresponse.err = err;
			if (!err) {
				JSONresponse.UserInfo = result;
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;