var mongoose = require("mongoose");


/* Mongoose for whatever reason doesn't allow schema specific things to be in sub-documents (required, unique, trim, etc) however they allow an object with these properties to be there.
    This is troublesome because if you want to do some pre/post hooks you can not since they aren't schemas, need to figure out a fix for this.
 */
var displayNameSchema = new mongoose.Schema({
    type: String
});

var nameSchema = new mongoose.Schema({
    First: String,
    Last: String,
});

var emailSchema = {
    type: String,
    required: false,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    trim: true,
    lowercase: true,
}

var emailSchemaRequired = {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    trim: true,
    lowercase: true
};

var passwordSchema = {
    type: String,
    required: true,
    trim: true,
    match: [/((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20})/, 'Password must be between 6-20 characters long, contain at least 1 lowercase, 1 uppercase and a number between 0-9']
        /*(?=.*[@#$%])*/
};

var genderSchema = {
    type: String,
    enum: ["MALE", "FEMALE", "OTHER"],
    default: 'OTHER'
};

var addressSchema = new mongoose.Schema({
    Tag: String,
    State: String,
    Country: String,
    City: String,
    Street: String,
    Postcode: String,
});

var dobSchema = new mongoose.Schema({
    DateFull: Date,
    Day: Number,
    Month: Number,
});

dobSchema.pre('save', function(next) {
    var date = new Date(this.DateFull);
    this.Day = date.getDate();
    this.Month = date.getMonth() + 1;
    next();
});

var roleSchema = {
    type: String,
    enum: ["Choose", "Student", "Teacher", "Convenor"],
    default: 'Student'
};

module.exports = {
    nameSchema: nameSchema,
    emailSchema: emailSchema,
    emailSchemaRequired: emailSchemaRequired,
    passwordSchema: passwordSchema,
    genderSchema: genderSchema,
    addressSchema: addressSchema,
    dobSchema: dobSchema,
    roleSchema: roleSchema
}