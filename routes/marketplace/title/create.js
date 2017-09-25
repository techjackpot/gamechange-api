var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../../additional-code/helperfunctions');
var ItemTitles = require('../../../model/marketitems/marketitem.model').ItemTitles;
var router = express.Router();
var debug = require('debug')('titlecreate');
var ERR_CODE = require('../../../error_codes');



router.route("/create")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {

				var itemTitle = new ItemTitles();

				itemTitle.Name = req.body.Name;
				itemTitle.Cost = req.body.Name.split(' ').length * 5;
				itemTitle.save(function(err, doc) {
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
				JSONresponse.ItemTitle = result;
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;