var express = require('express');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var debug = require('debug')('login');
var chaosConfig = require('../../config/chaosconfig');
var requireDir = require('require-dir');
var mongoDB = require('../../mongo');
var Admin = require('../../model/admin/admin.model').Admin;
var PassportsDir = requireDir('../../model/passportdefinitions');
var PassportType = require('../../model/passporttypes/passporttype.model').PassportType;
var router = express.Router();
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var JWT_EXPIRE_TIME = '30m';
var ERR_CODE = require('../../error_codes');
var path = require('path');

router.route("/login")
	.post(function(req, res) {
		var response = {};

		async.waterfall([

				function(callback) {

					Admin.find({
						'Username': req.body.Username
					}).exec(function(err, docs) {
						if (err)
							callback("Incorrect Username/Password");
						else {
							docs[0].ComparePassword(req.body.Password, function(err, isMatch) {
								if (err) {
									callback(err);
								} else {
									if (isMatch)
										callback(null, docs[0]._id);
									else
										callback("Incorrect Username/Password");
								}
							});
						}
					});
				},

				function(userID, callback) {
					debug("Logging in admin with %s", userID);

					var secret = chaosConfig.getPasswordSecret();

					/*jwt.sign({ foo: 'bar' }, secret, { algorithm: 'RS256' }, function(err, token) {
						console.log(err);
					  	console.log(token);
					});*/


					jwt.sign({
						UserId: userID
					}, secret, {
						expiresIn: chaosConfig.getExpireTime()
					}, function(err, token) {
						if (err) {
							console.log(userID);
							var errObject = helper.constructErrorResponse(ERR_CODE.TOKEN_ERROR, "Failed to sign token", 500);
							debug("Failed to sign token");
							callback(errObject);
						} else {
							debug("Signed token");
							var result = {};
							result.userID = userID;
							result.token = token;
							callback(null, result);

						}
						//
					});
				}
			],

			function(err, result) {
				var ComposedResponse = helper.ComposeJSONResponse(err);
				var StatusCode = ComposedResponse.code;
				var JSONresponse = ComposedResponse.response;

				if (!err) {
					JSONresponse.UserID = result.userID;
					JSONresponse.Token = result.token;
				}

				res.status(StatusCode).json(JSONresponse);
			});

	});

module.exports = router;