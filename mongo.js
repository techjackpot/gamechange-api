var mongoose = require("mongoose");
var async = require("async");
var chaosConfig = require("./config/chaosconfig");
var debug = require('debug')('mongo');
var Admin = require('./model/admin/admin.model').Admin;

module.exports = {
	PassIDs: [],
	PassTypes: [],
	ServerReady: false,

	init: function(callback) {
		var exportObject = this;

		if (mongoose.connection.readyState == 1 || mongoose.connection.readyState == 2) {
			return;
		}

		debug("Attempting MongoDB Connection to " + chaosConfig.getMongoURL());


		mongoose.connect(chaosConfig.getMongoURL(), function(err) {

			if (err) {
				debug("Error, Failed to connection to database");
				callback(err);
			} else {
				var PassportType = require('./model/passporttypes/passporttype.model').PassportType;

				var Data = {
					ServerReady: false,
				};

				function MakeSuperAdmin(callback) {
					var newAdmin = new Admin();

					newAdmin.Username = "admin";
					newAdmin.Password = "G129dh5G";

					newAdmin.save(function(err, doc) {
						if (err)
							callback("Could not create user");
						else {
							debug("Made super admin");
							callback();
						}
					});
				}


				function MakePassportType(Name, callback) {
					async.waterfall([

							function(nextCallback) {
								PassportType.count({
									Name: Name
								}, function(err, count) {
									if (count <= 0) {
										var entry = new PassportType();
										entry.Name = Name;
										entry.MetaInfo = "";

										entry.save(function(err) {
											if (err) throw err;
											nextCallback(null);
										});
									} else {
										nextCallback(null);
									}
								});
							},
							function(nextCallback) {
								PassportType.findOne({
									'Name': Name
								}, 'Name _id', function(err, obj) {
									if (err) throw err;
									nextCallback(null, obj._id);
								});
							}
						],

						function(err, result) {
							exportObject.PassTypes.push(Name);
							callback(null, result);
						});
				}

				async.parallel({
						MakeSuperAdmin: function(callback) {
							MakeSuperAdmin(callback);
						}
					},
					function(err, results) {
						if (err)
							debug(err)
					});

				async.parallel({
						UsernamePassport: function(callback) {
							MakePassportType('UsernamePassport', callback);
						},
						EmailPassport: function(callback) {
							MakePassportType('EmailPassport', callback);
						},
						UserTokenPassport: function(callback) {
							MakePassportType('UserTokenPassport', callback);
						},
						TwitterPassport: function(callback) {
							MakePassportType('TwitterPassport', callback);
						},
						FacebookPassport: function(callback) {
							MakePassportType('FacebookPassport', callback);
						}
					},
					function(err, results) {
						debug(results);
						exportObject.PassIDs = results;
						exportObject.ServerReady = true;
					});

				callback();
			}

		});


	}
}