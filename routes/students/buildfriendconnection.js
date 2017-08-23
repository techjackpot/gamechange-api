var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Friends = require('../../model/friends/friend.model').Friends;
var router = express.Router();
var debug = require('debug')('users');
var ERR_CODE = require('../../error_codes');



router.route("/buildfriendconnection")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				if(!req.body.from) callback('Sender not provided');
				if(!req.body.to) callback('Receiver not provided');
				Friends.findOne({ $or: [{ "From": req.body.from, "To": req.body.to }, { "To": req.body.From, "From": req.body.To }] }).exec(function(err, doc) {
					if(err) callback(err);
					if(doc) {
						doc.Approved = true;
						callback(null, doc);
					} else {
						var newFriend = new Friends();
						newFriend.From = req.body.from;
						newFriend.To = req.body.to;
						newFriend.Approved = true;
						callback(null, newFriend);
					}
				});
			},
			function(connection, callback) {
				connection.save(function(err, doc) {
					if(err) callback(err);
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
				JSONresponse.FriendRequest = result;
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;