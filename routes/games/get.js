var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Classes = require('../../model/classes/class.model').Classes;
var router = express.Router();
var debug = require('debug')('games');
var ERR_CODE = require('../../error_codes');



router.route("/get")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				if(!req.body._id) return callback(null, null);
				Classes.findOne({ _id: req.body._id }).exec(function (err, doc) {
					if (err) {
						var errString = "Something bad happened";
						var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
						debug(errString);
						return callback(errObject);
					}
					if (doc) {
						return callback(null, doc);
					} else {
						return callback(null, null);
					}
				});
			}
		],
		function(err, result) {
			var ComposedResponse = helper.ComposeJSONResponse(err);
			var StatusCode = ComposedResponse.code;
			var JSONresponse = ComposedResponse.response;

			JSONresponse.err = err;
			if (!err) {
				JSONresponse.Class = result;
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;