var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../../additional-code/helperfunctions');
var ItemBackgrounds = require('../../../model/marketitems/marketitem.model').ItemBackgrounds;
var router = express.Router();
var debug = require('debug')('backgroundcreate');
var ERR_CODE = require('../../../error_codes');
var moment = require('moment');

router.route("/create")

.post(function(req, res, next) {
	async.waterfall([

			function(callback) {

				if (!req.files) {
					return res.status(400).send('No files were uploaded.');
				}
 				var Picture = req.files.Picture;
 				var timestamp = new Date().getTime();
 				var fname = 'backgrounds/' + '_' + timestamp + '.png';
				Picture.mv('public/' + fname, function(err) {
					if (err) {
						return res.status(500).send(err);
					}
          return callback(null, fname);
				});

			}, 
			function(pictureUrl, callback) {

				var itemBackground = new ItemBackgrounds();

				itemBackground.Picture = pictureUrl;

				itemBackground.save(function(err, doc) {
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
				JSONresponse.ItemBackground = result;
			}

			res.status(StatusCode).json(JSONresponse);

		});
});

module.exports = router;