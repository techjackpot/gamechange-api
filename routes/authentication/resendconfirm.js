var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var path = require('path');
var chaosConfig = require('../../config/chaosconfig');
var emailConfirmation = require('../../libs/emailconfirmation');
var async = require('async');
var user = require('../../model/user.model').User;
var debug = require('debug');


router.route("/resendconfirm")
	.post(function(req, res, next) {

		async.waterfall([

				function(callback) {

					if (req.body.Email === undefined || req.body.Email === null && chaosConfig.getConfirmEmail() !== 'true') {
						return callback({
							statusCode: 200,
							ERR_CODE: "ERR_MISSING_PARAMETER",
							err: "Email not supplied"
						});
					}

					return callback();

				},
				function(callback) {
					user
						.findOne({
							Email: req.body.Email
						})
						.exec(function(err, doc) {

							if (err) {
								return callback({
									statusCode: 500,
									ERR_CODE: "ERR_DB_ERROR",
									err: "Database Error"
								});
							}

							if (doc != null) {
								var welcomeMessage = req.body.WelcomeMessage || "";
								emailConfirmation.send(doc, welcomeMessage, function(err) {
									if (err) {
										debug(err);
									}
								});

								return callback(null, "ok");

							}
							return callback({
								statusCode: 200,
								ERR_CODE: "ERR_USER_DOESNT_EXIST",
								err: "User by that email doesn't exist"
							});
						});
				}
			],
			function(err, result) {
				var JSONresponse = {};

				var statusCode = 200;

				if (err) {
					JSONresponse.err = err.err;
					JSONresponse.ERR_CODE = err.ERR_CODE;
					statusCode = err.statusCode;
				}

				if (result)
					JSONresponse.Results = result;

				res.status(statusCode).json(JSONresponse);
				//helper.SendStandardJSON(res, err, result);
			});

	})
	.get(function(req, res, next) {

		async.waterfall([

				function(callback) {

					if (req.query.Email === undefined || req.query.Email === null && chaosConfig.getConfirmEmail() !== 'true') {
						return callback("No Email Inputted");
					}

					return callback();

				},
				function(callback) {
					user
						.findOne({
							Email: req.query.Email
						})
						.exec(function(err, doc) {

							if (err)
								return callback("database error");

							if (doc != null) {
								var welcomeMessage = req.body.WelcomeMessage || "";
								emailConfirmation.send(doc, welcomeMessage, function(err) {
									if (err) {
										debug(err);
									}
								});

								return callback(null, "ok");

							}
							return callback("No account by that email exists");
						});
				}
			],
			function(err, result) {

				res.status((err != null) ? 500 : 200).json((err != null) ? err : result);

				//helper.SendStandardJSON(res, err, result);
			});

	});

module.exports = router;