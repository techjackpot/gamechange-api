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



router.route("/create")

.post(function(req, res, next) {
	var group_data = req.body.group_data;
	var total_cnt = 0;
	for(var i=0; i<group_data.length; i++) {
		for(var j=0; j<group_data[i].length; j++) {
			total_cnt++;
		}
	}
	var class_info = req.body.current_class;
	var class_id = class_info._id;
	async.waterfall([
			function(callback) {
				Classes.findOne({ _id: class_id }).exec(function (err, doc) {
					if (err) {
						var errString = "Something bad happened";
						var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
						debug(errString);
						return callback(errObject);
					}
					if (doc) {
						return callback(null, doc);
					} else {
						return callback(null);
					}
				});
			},
			function(current_class, callback) {
				var p_done = 0;
				var groups = [];
				var myPromise = new Promise(function(resolve, reject) {
					for(var i=0; i<group_data.length; i++) {
						var newGroup = new Groups();
						newGroup.Title = String.fromCharCode(65+i);
						newGroup.Class = class_id;
						newGroup.save(function(group_err, new_group) {
							if (group_err) {
								return callback(group_err);
							}
							groups.push(new_group);
							if(groups.length==group_data.length) resolve(groups);
						});
					}
				});
				myPromise.then(function (new_groups) {
					return callback(null, current_class, new_groups)
				});
			},
			function(current_class, groups, callback) {
				var group_ids = [];
				for(var i=0; i<groups.length; i++) {
					group_ids.push(groups[i]._id);
				}
				current_class.Groups = group_ids;
				current_class.save(function(err, doc) {
					if(err) return callback(err);
					return callback(null, doc, groups);
				});
			},
			function(current_class, groups, callback) {
				var cnt = 0;
				var myPromise = new Promise(function(resolve, reject) {
					for(var i=0; i<group_data.length; i++) {
						for(var j=0;j<group_data[i].length;j++) {
							var newGroupStudent = new GroupStudents();
							newGroupStudent.Group = groups[i]._id;
							newGroupStudent.Class = class_id;
							newGroupStudent.Student = group_data[i][j];
							newGroupStudent.save(function(err, doc) {
								cnt++;
								if(cnt==total_cnt) {
									return resolve(current_class);
								}
							});
						}
					}
				});
				myPromise.then(function (class_info) {
					return callback(null, class_info)
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