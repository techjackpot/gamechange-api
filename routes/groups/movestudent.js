var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Classes = require('../../model/classes/class.model').Classes;
var Groups = require('../../model/classes/class.model').Groups;
var GroupStudents = require('../../model/classes/class.model').GroupStudents;
var router = express.Router();
var debug = require('debug')('classes');
var ERR_CODE = require('../../error_codes');



router.route("/movestudent")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				GroupStudents.update({ Class: req.body.class_id, Student: req.body.student_id, Group: req.body.from_group }, { Group: req.body.to_group }).exec(function (err) {
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
				JSONresponse.Result = 'successfully moved student';
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;