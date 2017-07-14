var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Cards = require('../../model/cards/card.model').Cards;
var router = express.Router();
var debug = require('debug')('Cards');
var ERR_CODE = require('../../error_codes');



router.route("/approve")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				Cards.findOne({ _id: req.body.card_id }).exec(function (err, doc) {
					if (err || !doc) {
						var errString = "Something bad happened";
						var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
						debug(errString);
						return callback(errObject);
					} else {
						return callback(null, doc);
					}
				});
			},
			function(card, callback) {
				card.Approved = req.body.Approved;
				card.save(function(err, doc) {
	        if (err)
	          return callback(err);
	        return callback(null, doc);
        });
			},
			function(card, callback) {
				Cards.findOne({ _id: card._id }).populate('Creator').exec(function (err, doc) {
					if (err || !doc) {
						var errString = "Something bad happened";
						var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
						debug(errString);
						return callback(errObject);
					} else {
						return callback(null, doc);
					}
				});
			}
		],
		function(err, result) {
			var ComposedResponse = helper.ComposeJSONResponse(err);
			var StatusCode = ComposedResponse.code;
			var JSONresponse = ComposedResponse.response;

			JSONresponse.err = err;
			if (!err) {
				JSONresponse.Card = result;
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;