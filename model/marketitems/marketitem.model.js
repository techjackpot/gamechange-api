var mongoose = require("mongoose");

var ItemTitleSchema = new mongoose.Schema({
		Name: {
			type: String,
			default: ''
		},
		Cost: {
			type: Number,
			default: 0
		}
	}, {
	  timestamps: true,
	  autoIndex: false
	}
);

var itemTitleModelSchema = mongoose.model('ItemTitles', ItemTitleSchema, 'ItemTitles');

var ItemBackgroundSchema = new mongoose.Schema({
		Picture: {
			type: String,
			default: ''
		},
		Cost: {
			type: Number,
			default: 50
		}
	}, {
	  timestamps: true,
	  autoIndex: false
	}
);
var itemBackgroundModelSchema = mongoose.model('ItemBackgrounds', ItemBackgroundSchema, 'ItemBackgrounds');

module.exports = {
	ItemTitles: itemTitleModelSchema,
	ItemBackgrounds: itemBackgroundModelSchema
}