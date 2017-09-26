var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var user = require('../../model/user.model').User;
var router = express.Router();
var debug = require('debug')('updateuser');
var ERR_CODE = require('../../error_codes');
var moment = require('moment');
var userCommon = require('../../libs/user/usercommon');

router.route("/update")

.post(function(req, res, next) {
		console.log(req.body);
	async.waterfall([

			function(callback) {
                userCommon.updateUser(req.decoded.UserId, req.body, function (err) {
                    if (err) {
                        return callback(err)
                    }

                    callback();
                });	
			}
		],

		function(err, result) {
			var ComposedResponse = helper.ComposeJSONResponse(err);
			var StatusCode = ComposedResponse.code;
			var JSONresponse = ComposedResponse.response;

            JSONresponse.err = err;
            if (!err) {
                
				JSONresponse.Message = "User successfully updated";
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;