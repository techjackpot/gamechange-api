var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Classes = require('../../model/classes/class.model').Classes;
var router = express.Router();
var debug = require('debug')('classes');
var ERR_CODE = require('../../error_codes');



router.route("/create")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				var newClass = new Classes();
				console.log(req.body);
				newClass.Name = req.body.Name;
				newClass.DateTime = req.body.DateTime;
				newClass.Users = req.body.Users;
				newClass.save(function(err, doc) {
					if (err) {

						var errString = "Something Bad Happened";
						var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);

						if (err.name == "ValidationError") {
							errString = "ClassName already exists";
							errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString);
						}

						debug(err);
						return callback(errObject);
					}
					callback(null, doc);
				});
			}
		],
		function(err, result) {
			var ComposedResponse = helper.ComposeJSONResponse(err);
			var StatusCode = ComposedResponse.code;
			var JSONresponse = ComposedResponse.response;

			JSONresponse.err = err;
			if (!err) {
				JSONresponse.Classes = result;
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;