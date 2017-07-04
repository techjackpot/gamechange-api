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



router.route("/getclass")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				if(!req.body.student_id) callback('No student id provided');
				var student_id = req.body.student_id;
				Classes.find({ "Students": student_id }).exec(function (err, docs) {
					if (err) {
						var errString = "Something bad happened";
						var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
						debug(errString);
						callback(errObject);
					} else if (docs.length > 0) {
						callback(null, docs);

					} else {

						callback(null, []);
					}
				});
			},
			function(classes, callback) {
				var myPromise = new Promise(function(resolve, reject) {
					var ret_classes = [];
					classes.forEach(function(class_info) {
						var t_class = Object.assign({},class_info._doc);
						GroupStudents.findOne({ "Class": class_info._id, "Student": req.body.student_id }).populate("Group").exec(function(err, doc) {
							if(err) callback(err);
							if(doc) {
								t_class['my_group'] = doc.Group;
								ret_classes.push(t_class);//Object.assign({ my_group: doc.Group }, class_info));
							} else {
								t_class['my_group'] = null;
								ret_classes.push(t_class);//Object.assign({ my_group: null }, class_info));
							}
							if(ret_classes.length == classes.length) {
								resolve(ret_classes);
							}
						});
					})
				});
				myPromise.then(function(ret_classes) {
					return callback(null, ret_classes)
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