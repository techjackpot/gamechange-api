var mongoose = require("mongoose");

var Schema = new mongoose.Schema({
        Name: {type: String, required: true, unique: true},
        MetaInfo: String,
});


var schema = mongoose.model('PassportType', Schema, 'PassportType');

module.exports = {
  PassportType: schema
}