var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var user = require('../../model/user.model').User;
var router = express.Router();
var debug = require('debug')('updateuser');
var ERR_CODE = require('../../error_codes');
var moment = require('moment');
var userCommon = require('../../libs/user/usercommon');

router.route("/uploadprofilepicture")

.post(function(req, res, next) {
	async.waterfall([

			function(callback) {

				if(!req.body.Profile) {
					return res.status(400).send('No file were uploaded.');
				}

			  var matches = req.body.Profile.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
			    response = {};

			  if (matches.length !== 3) {
			    return new Error('Invalid input string');
			  }

			  response.type = matches[1];
			  response.data = new Buffer(matches[2], 'base64');

 				var timestamp = new Date().getTime();
 				var fname = 'avatars/' + req.decoded.UserId + '_' + timestamp + '.png';

				require("fs").writeFile('public/' + fname, response.data, 'base64', function(err) {
					console.log(err);
					if(err) {
						return res.status(500).send(err);
					}
          userCommon.updateUser(req.decoded.UserId, { "Data": { "DisplayPicture": fname } }, function (err) {
            if (err) {
              return callback(err)
            }

            callback(null, fname);
          });	
				});
			}
		],

		function(err, result) {
			var ComposedResponse = helper.ComposeJSONResponse(err);
			var StatusCode = ComposedResponse.code;
			var JSONresponse = ComposedResponse.response;

            JSONresponse.err = err;
            if (!err) {
                
				JSONresponse.Message = "User profile picture successfully uploaded";
				JSONresponse.URL = result;
			}

			res.status(StatusCode).json(JSONresponse);

		});
});

module.exports = router;