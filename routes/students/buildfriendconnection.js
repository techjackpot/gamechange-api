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
				var newFriend = new Friends();
				newFriend.From = req.body.from;
				newFriend.To = req.body.to;
				newFriend.Approved = true;
				newFriend.save(function(err, doc) {
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