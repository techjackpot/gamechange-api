var express = require('express');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Raffle = require('../../model/raffles/raffle.model').Raffle;
var Prize = require('../../model/raffles/prize.model').Prize;
var router = express.Router();
var debug = require('debug')('createprize');
var ERR_CODE = require('../../error_codes');

router.route("/create")

.post(function(req, res, next) {

	async.waterfall([

			function(callback) {

				if (req.body.Prizes.length > 0 && req.body.RaffleName) {

					var PrizesPassedValidation = true;
					for (var i = 0; i < req.body.Prizes.length; i++) {
						if (!req.body.Prizes[i].Name) {
							PrizesPassedValidation = false;
							break;
						}
					}
					if (PrizesPassedValidation) {
						callback();
						return;
					}
				}

				var errString = "Prizes malformed or Raffle Name not supplied";
				var errObject = helper.constructErrorResponse(ERR_CODE.INCORRECT_PROPERTY, errString);
				debug(errString);
				callback(errObject);

			},
			function(callback) {

				Raffle
					.find({
						'Name': req.body.RaffleName
					})
					.exec(function(err, docs) {
						if (err) {
							var errString = "Something Bad Happened";
							var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
							debug(errString);
							callback(errObject);
						} else {
							if (docs.length > 0) {
								callback(null, docs[0]);
							} else {
								var errString = "Could not find document";
								var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString);
								debug(errString);
								callback(errObject);
							}
						}
					});

			},

			function(raffle, callback) {

				var rafflePrizes = [];

				for (var i = 0; i < req.body.Prizes.length; i++) {

					rafflePrizes.push(new Prize(req.body.Prizes[i]));
				}

				var SavedPrizes = [];


				async.each(rafflePrizes, function(prize, callback) {
					prize.save(function(err, doc) {
						if (err) {
							var errString = "Something Bad Happened";
							var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
							debug(errString);
							callback(errObject);
						} else {
							debug(doc);
							SavedPrizes.push(doc);
							callback();
						}
					});
				}, function(err) {
					if (err) {
						var errString = "One of the prizes failed to save. Undoing previous prizes";
						var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString);
						debug(errString);
						callback(errObject);
						DeleteDocs(SavedPrizes)
					} else {

						for (var i = 0; i < SavedPrizes.length; i++) {
							raffle.Prizes.push(SavedPrizes[i]._id);
						}

						raffle.save(function(err, doc) {
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


function DeleteDocs(objs) {
	async.each(objs, function(obj, callback) {
		obj.constructor.remove({
			_id: obj._id
		}, function(err) {
			if (err) {
				debug("Could not remove one of the passports.");
			}
		});
	});
}

module.exports = router;