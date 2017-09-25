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
				if(!req.body.Picture) {
					return res.status(400).send('No file were uploaded.');
				}

			  var matches = req.body.Picture.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
			    response = {};

			  if (matches.length !== 3) {
			    return new Error('Invalid input string');
			  }

			  response.type = matches[1];
			  response.data = new Buffer(matches[2], 'base64');

 				var timestamp = new Date().getTime();
 				var fname = 'cards/' + cardData.Creator + '_' + timestamp + '.png';

				require("fs").writeFile('public/' + fname, response.data, 'base64', function(err) {
					console.log(err);
					if(err) {
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
				card.BackgroundInfo = cardData.BackgroundInfo;
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