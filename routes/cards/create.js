var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Cards = require('../../model/cards/card.model').Cards;
var router = express.Router();
var debug = require('debug')('cards');
var ERR_CODE = require('../../error_codes');



router.route("/create")

.post(function(req, res, next) {
	var cardData = JSON.parse(req.body.cardData);
	async.waterfall([
			function(callback) {
				if (!req.files) {
					return res.status(400).send('No files were uploaded.');
				}
 				var Picture = req.files.Picture;
 				var timestamp = new Date().getTime();
 				var fname = 'cards/' + cardData.Creator + '_' + timestamp + '.png';
				Picture.mv('public/' + fname, function(err) {
					if (err) {
						return res.status(500).send(err);
					}
          return callback(null, fname);
				});
			},
			function(pictureUrl, callback) {

				var card = new Cards();

				card.Title = cardData.Title;
				card.Description = cardData.Description;
				card.Type = cardData.Type;
				card.Rarity = cardData.Rarity;
				card.GoldCost = cardData.GoldCost;
				card.Picture = pictureUrl;
				card.Actions = cardData.Actions;
				card.Creator = cardData.Creator;
				card.Approved = false;
				card.save(function(err, doc) {
					if (err) {
						return callback(err);
					}
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
				JSONresponse.Card = result;
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;