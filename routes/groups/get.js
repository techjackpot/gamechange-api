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



router.route("/get")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				if(!req.body._id) return callback('No class presented');
				Classes.findOne({ _id: req.body._id }).exec(function (err, doc) {
					if (err) {
						var errString = "Something bad happened";
						var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
						debug(errString);
						callback(errObject);
					} 
					if (doc) {
						return callback(null, doc);
					} else {
						return callback('No such class');
					}
				});
			},
			function(current_class, callback) {
				Groups.find({ "Class": current_class._id }).exec(function (err, docs) {
					if(err) return callback(err);
					if(docs.length==0) return callback(null, []);
					var ret_groups = [];
					var myPromise = new Promise(function(resolve, reject) {
						docs.forEach(function (doc) {
							GroupStudents.find({ "Group": doc._id }, { "Student":1, _id:0 }).exec(function (group_err, students) {
								if(group_err) return callback(group_err);
								var ret_students = [];
								for(var i=0; i<students.length; i++) {
									ret_students.push(students[i].Student);
								}
								ret_groups.push({
									_id: doc._id,
									Title: doc.Title,
									Students: ret_students
								});
								if(ret_groups.length==docs.length) {
									resolve(ret_groups);
								}
							});
						});
					});
					myPromise.then(function(response) {
						return callback(null, response);
					});
				});
			}
		],
		function(err, result) {
			var ComposedResponse = helper.ComposeJSONResponse(err);
			var StatusCode = ComposedResponse.code;
			var JSONresponse = ComposedResponse.response;

			JSONresponse.err = err;
			if (!err) {
				JSONresponse.Groups = result.sort((a,b) => a.Title.localeCompare(b.Title));
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;