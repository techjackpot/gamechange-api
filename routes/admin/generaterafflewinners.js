var express = require('express');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Raffle = require('../../model/raffles/raffle.model').Raffle;
var RaffleTicket = require('../../model/raffles/raffleticket.model').RaffleTicket;
var router = express.Router();
var debug = require('debug')('getrafflewinners');
var ERR_CODE = require('../../error_codes');

router.route("/generatewinners")

.post(function(req, res, next) {

	async.waterfall([

			function(callback) {

				var QueryObj = {};

				if (req.body.Name) {
					QueryObj.Name = req.body.Name;

					Raffle
						.find(QueryObj)
						.exec(function(err, docs) {
							if (err) {
								var errString = "Something Bad Happened";
								var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
								debug(errString);
								callback(errObject);
							} else {
								if (docs.length == 1) {

									callback(null, docs[0]);
								} else {
									var errString = "Couldn't find any raffle documents";
									var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString);
									debug(errString);
									callback(errObject);
								}
							}
						});

				} else {
					var errString = "Name not supplied";
					var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 200);
					debug(errString);
					callback(errObject);
				}



			},
			function(raffle, callback) {


				if (raffle.AlreadyDrawn) {
					RaffleTicket
						.find({
							Raffle: raffle._id,
							Status: 'Winner'
						})
						.populate('User')
						.exec(function(err, docs) {
							if (err) {
								var errString = "Something Bad Happened";
								var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
								debug(errString);
								callback(errObject);
							} else {
								if (docs.length > 0) {

									callback(null, docs);
								} else {
									var errString = "Couldn't find any raffle documents";
									var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString);
									debug(errString);
									callback(errObject);
								}
							}
						});

				} else {
					/* mongoose-simple-random does not allow for the other syntax */
					RaffleTicket.findRandom({
						Raffle: raffle._id,
						Status: 'Draw'
					}, {}, {
						limit: raffle.PrizeCount,
						populate: 'User'
					}, function(err, docs) {
						if (err) {
							var errString = "Something Bad Happened";
							var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
							debug(errString);
							callback(errObject);
						} else {
							if (docs.length > 0) {
								raffle.AlreadyDrawn = true;

								raffle.save(function(err) {
									if (err)
										debug(err);
								});

								callback(null, docs);

							} else {
								var errString = "Couldn't find any raffle documents";
								var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString);
								debug(errString);
								callback(errObject);
							}
						}
					});
				}


			},
			function(raffleTickets, callback) {

				var Users = [];
				var ticketIDs = [];
				for (var i = 0; i < raffleTickets.length; i++) {
					ticketIDs.push(raffleTickets[i]._id);
					Users.push(raffleTickets[i].User);
				}


				RaffleTicket.update({
					_id: {
						"$in": ticketIDs
					}
				}, {
					Status: 'Winner'
				}, {
					multi: true
				}, function(err, docs) {
					if (err) {
						var errString = "Something Bad Happened";
						var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
						debug(errString);
						callback(errObject);
					} else {
						callback(null, Users);
					}

				});
			}
		],

		function(err, result) {
			var ComposedResponse = helper.ComposeJSONResponse(err);
			var StatusCode = ComposedResponse.code;
			var JSONresponse = ComposedResponse.response;

			if (!err) {
				JSONresponse.Message = "Found Raffles";
				JSONresponse.RafflesWinners = result;

			}

			res.status(StatusCode).json(JSONresponse);
		});

});


module.exports = router;