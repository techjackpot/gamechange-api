var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var path = require('path');
var chaosConfig = require('../../config/chaosconfig');
var emailConfirmation = require('../../libs/emailconfirmation');
var async = require('async');


router.route("/confirmemail")

.get(function(req, res, next) {

	async.waterfall([

			function(callback) {

		if (req.query.token === undefined || req.query.token === null && chaosConfig.getConfirmEmail() !== 'true') {
					return callback("No Email Inputted");
				}

				return callback();

			},
			function(callback) {
				emailConfirmation.check(req.query.token, function(err) {
					if (err)
						callback(err);
					else
						callback("Successfully confirmed email");
				});
			}
		],
		function(err, result) {

			res.status((err != null) ? 500 : 200).json((err != null) ? err : result);

			//helper.SendStandardJSON(res, err, result);
		});


});

module.exports = router;