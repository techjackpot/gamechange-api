var mongoose = require("mongoose");

var friendSchema = new mongoose.Schema({
		From: {
			type: mongoose.Schema.ObjectId,
			ref: 'Users'
		},
		To: {
			type: mongoose.Schema.ObjectId,
			ref: 'Users'
		},
		Approved: {
			type: Boolean,
			default: false
		}
	}, {
		timestamps: true
	}
);

var friendModelSchema = mongoose.model('Friends', friendSchema, 'Friends');

module.exports = {
	Friends: friendModelSchema
}