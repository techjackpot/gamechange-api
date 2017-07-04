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

				if (!req.files) {
					return res.status(400).send('No files were uploaded.');
				}
 				var Profile = req.files.Profile;
 				var timestamp = new Date().getTime();
 				var fname = 'avatars/' + req.decoded.UserId + '_' + timestamp + '.png';
				Profile.mv('public/' + fname, function(err) {
					console.log(err);
					if (err) {
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

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;