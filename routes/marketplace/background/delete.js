var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../../additional-code/helperfunctions');
var ItemBackgrounds = require('../../../model/marketitems/marketitem.model').ItemBackgrounds;
var router = express.Router();
var debug = require('debug')('backgrounddelete');
var ERR_CODE = require('../../../error_codes');
var fs = require('fs');


router.route("/delete")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				if (req.body._id !== undefined)
					return callback();

				var errString = "No Background supplied";
				var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString);
				debug(errString);
				callback(errObject);
			},
			function(callback) {
				ItemBackgrounds.findOne({ _id: req.body._id }).exec(function(err, doc) {
					if(err) {
						return callback(err);
					}
					fs.unlink('public/'+doc.Picture, function(err) {
						ItemBackgrounds.remove({
							_id: req.body._id
						}).exec(function(err) {
							if (err) {
								var errString = "You cannot delete this Background";
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
				JSONresponse.Message = 'Successfully removed Background';
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;