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

var OwnedTitleSchema = new mongoose.Schema({
		Student: {
			type: mongoose.Schema.ObjectId,
			ref: 'Users'
		},
		Title: {
			type: mongoose.Schema.ObjectId,
			ref: 'ItemTitles'
		}
	}, {
	  timestamps: true,
	  autoIndex: false
	}
);

var ownedTitleModelSchema = mongoose.model('OwnedTitles', OwnedTitleSchema, 'OwnedTitles');

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

var OwnedBackgroundSchema = new mongoose.Schema({
		Student: {
			type: mongoose.Schema.ObjectId,
			ref: 'Users'
		},
		Background: {
			type: mongoose.Schema.ObjectId,
			ref: 'ItemBackgrounds'
		}
	}, {
	  timestamps: true,
	  autoIndex: false
	}
);

var ownedBackgroundModelSchema = mongoose.model('OwnedBackgrounds', OwnedBackgroundSchema, 'OwnedBackgrounds');

module.exports = {
	ItemTitles: itemTitleModelSchema,
	ItemBackgrounds: itemBackgroundModelSchema,
	OwnedTitles: ownedTitleModelSchema,
	OwnedBackgrounds: ownedBackgroundModelSchema
}