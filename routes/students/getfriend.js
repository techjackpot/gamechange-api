var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Friends = require('../../model/friends/friend.model').Friends;
var router = express.Router();
var debug = require('debug')('users');
var ERR_CODE = require('../../error_codes');



router.route("/getfriend")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				if(!req.body.student_id) callback('No student id provided');
				var student_id = req.body.student_id;
				Friends.find({ $or: [{ "From": student_id }, { "To": student_id }]/*, Approved: true*/ }).sort('Approved').populate('From').populate('To').exec(function (err, docs) {
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
			/*function(friends, callback) {
				Friends.find({ "To": student_id, Approved: false }).populate('User1').exec(function (err, docs) {
					if(err) callback(err);
					if(docs.length>0) {
						return callback(null, friends, docs);
					} else {
						return callback(null, friends, []);
					}
				});
			}*/
		],
		function(err, result1/*, result2*/) {
			var ComposedResponse = helper.ComposeJSONResponse(err);
			var StatusCode = ComposedResponse.code;
			var JSONresponse = ComposedResponse.response;

			JSONresponse.err = err;
			if (!err) {
				JSONresponse.Friends = result1;
				//JSONresponse.Requests = result2;
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;