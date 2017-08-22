var mongoose = require("mongoose");

var keywordSchema = new mongoose.Schema({

});

var cardSchema = new mongoose.Schema({
		Title: {
			type: String,
		},
		Description: {
			type: String,
		},
		Picture: {
			type: String,
		},
		Type: {
	    type: String,
	    enum: ["Special", "Common", "Defence", "Offence"],
	    default: 'Common'
		},
		Rarity: {
	    type: String,
	    enum: ["Common", "Uncommon", "Rare"],
	    default: 'Common'
		},
		Creator: {
			type: mongoose.Schema.ObjectId,
			ref: 'Users'
		},
		GoldCost: {
			type: Number,
			default: 1
		},
		Actions: [{
			Keyword: {
				type: String,
				enum: ["Add Points", "Subtract Points", "Add Gold", "Subtract Gold", "Add Cards", "Subtract Cards", "Defend Negative", "Perform Action", "Persist", "Activation Time", "Add Friend"],
				default: 'Add Points'
			},
			Target: {
				type: String,
				enum: ["Self", "Friends", "Others"],
				default: 'Self'
			},
			TargetValue: {
				type: Number,
				default: 1
			},
			KeywordValue: {
				type: Number,
				default: 1
			},
			Description: {
				type: String,
				default: ''
			}
		}],
		Approved: {
			type: Boolean,
			default: false
		}
	}, {
	  timestamps: true,
	  autoIndex: false
	}
);
var cardModelSchema = mongoose.model('Cards', cardSchema, 'Cards');

module.exports = {
	Cards: cardModelSchema
}