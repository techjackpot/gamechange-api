var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Cards = require('../../model/cards/card.model').Cards;
var router = express.Router();
var debug = require('debug')('cards');
var ERR_CODE = require('../../error_codes');
var fs = require('fs');


router.route("/delete")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				if (req.body.card_id !== undefined)
					return callback();

				var errString = "No Card supplied";
				var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString);
				debug(errString);
				callback(errObject);
			},
			function(callback) {
				Cards.findOne({ _id: req.body.card_id }).exec(function(err, doc) {
					if(err) {
						return callback(err);
					}
					fs.unlink('public/'+doc.Picture, function(err) {
						Cards.remove({
							_id: req.body.card_id
						}).exec(function(err) {
							if (err) {
								var errString = "You cannot delete this Card";
								var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString);
								return callback(errObject);
							} else
								return callback();
						});
					});
				})
			}
		],
		function(err, result) {
			var ComposedResponse = helper.ComposeJSONResponse(err);
			var StatusCode = ComposedResponse.code;
			var JSONresponse = ComposedResponse.response;

			JSONresponse.err = err;
			if (!err) {
				JSONresponse.Message = 'Successfully removed Card';
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;