var mongoose = require("mongoose");

var Schema = new mongoose.Schema({
	Name: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
	Users: [{
		type: mongoose.Schema.ObjectId,
		ref: 'Users'
	}],
	DateTime: {
		type: String,
		default: ''
	}
}, {
	timestamps: true
});


var schema = mongoose.model('Class', Schema, 'Classes');

module.exports = {
	Classes: schema
}