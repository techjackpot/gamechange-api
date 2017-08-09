var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var MarkTypes = require('../../model/marks/mark.model').MarkTypes;
var router = express.Router();
var debug = require('debug')('marktypes');
var ERR_CODE = require('../../error_codes');



router.route("/removetype")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				MarkTypes.remove({ _id: req.body._id }).exec(function (err) {
					if (err) {
						var errString = "Something bad happened";
						var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
						debug(errString);
						return callback(errObject);
					} else {
						return callback();
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
				JSONresponse.Result = 'successfully removed marktype';
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;