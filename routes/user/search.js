var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var user = require('../../model/user.model').User;
var router = express.Router();
var debug = require('debug')('getuser');
var ERR_CODE = require('../../error_codes');
var userCommon = require('../../libs/user/usercommon');



router.route("/search")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				if (req.body.Search === undefined || req.body.Search === null || !req.body.Search) {
					var errString = "Search field is missing";
					var errObject = helper.constructErrorResponse("ERR_MISSING_PROPERTY", errString);
					debug(errString);
					return callback(errObject);
				}

				return callback();
			},
			function(callback) {

				var skip = req.body.Skip || 0;
				var limit = req.body.Limit || 10;

				if (req.body.limit <= 0)
					limit = 10;
				else if (limit > 50)
					limit = 50;

				userCommon.searchDisplaynameOrEmail(req.decoded.UserId, req.body.Search, limit, skip, function(err, users) {
					if (err) {
						return callback(err);
					}

					callback(null, users);
				});
			}
		],
		function(err, result) {
			var ComposedResponse = helper.ComposeJSONResponse(err);
			var StatusCode = ComposedResponse.code;
			var JSONresponse = ComposedResponse.response;

			JSONresponse.err = err;
			if (!err) {
				JSONresponse.Users = result;
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;