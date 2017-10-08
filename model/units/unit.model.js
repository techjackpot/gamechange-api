var mongoose = require("mongoose");

var unitSchema = new mongoose.Schema({
		Name: {
			type: String,
			default: '',
		},
		Description: {
			type: String,
			default: ''
		}
	}, {
	  timestamps: true,
	  autoIndex: false
	}
);
var unitModelSchema = mongoose.model('Units', unitSchema, 'Units');

module.exports = {
	Units: unitModelSchema
}