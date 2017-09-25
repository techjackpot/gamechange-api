var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Classes = require('../../model/classes/class.model').Classes;
var Groups = require('../../model/classes/class.model').Groups;
var GroupStudents = require('../../model/classes/class.model').GroupStudents;
var Tasks = require('../../model/tasks/task.model').Tasks;
var router = express.Router();
var debug = require('debug')('classes');
var ERR_CODE = require('../../error_codes');



router.route("/reset")

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
				GroupStudents.deleteMany({
					"Group": {
						$in: current_class.Groups
					}
				}).exec(function (err) {
					if(err) {
						return callback(err);
					}
					return callback(null, current_class);
				})
			},
			function(current_class, callback) {
				Groups.deleteMany({
					"Class": current_class._id
				}).exec(function (err) {
					if(err) {
						return callback(err);
					}
					return callback(null, current_class);
				})
			},
			function(current_class, callback) {
				Tasks.deleteMany({
					"Class": current_class._id
				}).exec(function (err) {
					if(err) {
						return callback(err);
					}
					return callback(null, current_class);
				});
			},
			function(current_class, callback) {
				current_class.Tasks = [];
				current_class.Groups = [];
				current_class.save(function(err, doc) {
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