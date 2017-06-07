var express = require('express');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Raffle = require('../../model/raffles/raffle.model').Raffle;
var router = express.Router();
var debug = require('debug')('createraffle');
var ERR_CODE = require('../../error_codes');

router.route("/create")

.post(function(req, res, next) {

	async.waterfall([

			function(callback) {

				if (req.body.Name)
					callback();
				else {
					var errString = "Name or Namespace not present";
					var errObject = helper.constructErrorResponse(ERR_CODE.INCORRECT_PROPERTY, errString);
					debug(errString);
					callback(errObject);
				}

			},
			function(callback) {

				Raffle
					.find({
						'Name': req.body.Name
					})
					.exec(function(err, docs) {
						if (err) {
							var errString = "Something Bad Happened";
							var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
							debug(errString);
							callback(errObject);
						} else {
							if (docs.length > 0) {
								console.log("found doc: %s", docs[0]);
								callback(null, docs[0]);
							} else {
								console.log("didn't find doc");
								callback(null, undefined);
							}
						}
					});

			},

			function(raffle, callback) {

				var newRaffle = (raffle) ? raffle : new Raffle();

				newRaffle.Name = req.body.Name;

				if (req.body.Description)
					newRaffle.Description = req.body.Description;

				if (req.body.PrizeCount)
					newRaffle.PrizeCount = req.body.PrizeCount;

				if (req.body.DateStart)
					newRaffle.DateStart = req.body.DateStart;

				if (req.body.DateEnd)
					newRaffle.DateEnd = req.body.DateEnd;

				if (req.body.Tags)
					newRaffle.Tags = req.body.Tags;

				if (req.body.Levels)
					newRaffle.Levels = req.body.Levels;

				newRaffle.save(function(err, doc) {
					if (err) {
						var errString = "Something Bad Happened";
						var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
						debug(errString);
						callback(errObject);
					} else {

						callback(null, doc);
					}
				});

			}
		],

		function(err, result) {
			var ComposedResponse = helper.ComposeJSONResponse(err);
			var StatusCode = ComposedResponse.code;
			var JSONresponse = ComposedResponse.response;

			if (!err) {
				JSONresponse.Message = "Raffle successfully added";
				JSONresponse.result = result;

			}

			res.status(StatusCode).json(JSONresponse);
		});

});


module.exports = router;