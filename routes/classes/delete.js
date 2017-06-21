var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Classes = require('../../model/classes/class.model').Classes;
var router = express.Router();
var debug = require('debug')('classes');
var ERR_CODE = require('../../error_codes');



router.route("/delete")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				if (req.body._id !== undefined)
					return callback();

				var errString = "No Class supplied";
				var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString);
				debug(errString);
				callback(errObject);
			},
			function(callback) {
				Classes.remove({
					_id: req.body._id
				}).exec(function(err) {
					if (err) {
						var errString = "You cannot delete this Class";
						var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString);
						return callback(errObject);
					} else
						return callback();
				});
			}
		],
		function(err, result) {
			var ComposedResponse = helper.ComposeJSONResponse(err);
			var StatusCode = ComposedResponse.code;
			var JSONresponse = ComposedResponse.response;

			JSONresponse.err = err;
			if (!err) {
				JSONresponse.Message = 'Successfully removed Class';
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;