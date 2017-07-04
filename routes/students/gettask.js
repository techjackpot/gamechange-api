var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Classes = require('../../model/classes/class.model').Classes;
var GroupStudents = require('../../model/classes/class.model').GroupStudents;
var Groups = require('../../model/classes/class.model').Groups;
var Tasks = require('../../model/tasks/task.model').Tasks;
var router = express.Router();
var debug = require('debug')('classes');
var ERR_CODE = require('../../error_codes');



router.route("/gettask")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				if(!req.body.student_id) callback('No student id provided');
				var student_id = req.body.student_id;
				GroupStudents.find({ "Student": student_id }).exec(function (err, docs) {
					if (err) {
						var errString = "Something bad happened";
						var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
						debug(errString);
						return callback(errObject);
					} else if (docs.length>0) {
						return callback(null, docs);
					} else {
						return callback(null, []);
					}
				});
			},
			function(groups, callback) {
				var student_id = req.body.student_id;
				Classes.find({ "Students": student_id }).exec(function (err, docs) {
					if (err) {
						var errString = "Something bad happened";
						var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
						debug(errString);
						callback(errObject);
					} else if (docs.length > 0) {
						callback(null, docs, groups);

					} else {

						callback(null, [], groups);
					}
				});
			},
			function(classes, groups, callback) {
				//if(groups.length==0) return callback(null, []);

				var conds = [];
				groups.forEach(function(group) {
					//conds.push({ $and: [ { "Group":group.Group } , { "Class": group.Class } ] });
					conds.push({ "Group": group.Group, "Class": group.Class });
				});
				classes.forEach(function(class_info) {
					conds.push({ "Class": class_info._id, "Group": null });
				});
				if(conds.length == 0) return callback(null, []);

				Tasks.find({ $or: conds }).populate('Class').populate('Group').exec(function (err, docs) {
						if(err) {
							return callback(err);
						}
						if(docs.length>0) {
							return callback(null, docs);
						} else {
							return callback(null, []);
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
				JSONresponse.Tasks = result;
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;