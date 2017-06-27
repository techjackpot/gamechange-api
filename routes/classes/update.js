var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Classes = require('../../model/classes/class.model').Classes;
var router = express.Router();
var debug = require('debug')('classes');
var ERR_CODE = require('../../error_codes');



router.route("/update")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				Classes.findOne({ _id: req.body._id }).exec(function (err, doc) {
					if (err || !doc) {
						var errString = "Something bad happened";
						var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
						debug(errString);
						return callback(errObject);
					} else {
						return callback(null, doc);
					}
				});
			},
			function(classInfo, callback) {
				for(var key in req.body) {
					if(key == '_id') continue;
					classInfo[key] = req.body[key];
				}
				classInfo.save(function(err, doc) {
	        if (err)
	          return callback(err);
	        return callback(null, doc);
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