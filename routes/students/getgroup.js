var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Classes = require('../../model/classes/class.model').Classes;
var GroupStudents = require('../../model/classes/class.model').GroupStudents;
var Groups = require('../../model/classes/class.model').Groups;
var router = express.Router();
var debug = require('debug')('classes');
var ERR_CODE = require('../../error_codes');



router.route("/getgroup")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				if(!req.body.student_id) callback('No student id provided');
				if(!req.body.class_id) callback('No class id provided');
				var student_id = req.body.student_id;
				var class_id = req.body.class_id;
				GroupStudents.findOne({ "Student": student_id, "Class": class_id }).exec(function (err, doc) {
					if (err) {
						var errString = "Something bad happened";
						var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
						debug(errString);
						return callback(errObject);
					} else if (doc) {
						return callback(null, doc);
					} else {
						return callback(null, null);
					}
				});
			},
			function(groupInfo, callback) {
				var group_id = null;
				var group_students = null;
				if(groupInfo) {
					group_id = groupInfo.Group;
					GroupStudents.find({ "Class": req.body.class_id, "Group": group_id, "Student": { $ne: req.body.student_id } }, { Student: 1, _id: 0}).exec(function (err, docs) {
							if(err) {
								return callback(err);
							}
							if(docs.length>0) {
								return callback(null, docs);
							} else {
								return callback(null, []);
							}
					});
				} else {
					return callback(null, []);
				}
			}
		],
		function(err, result) {
			var ComposedResponse = helper.ComposeJSONResponse(err);
			var StatusCode = ComposedResponse.code;
			var JSONresponse = ComposedResponse.response;

			JSONresponse.err = err;
			if (!err) {
				JSONresponse.Members = result;
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;