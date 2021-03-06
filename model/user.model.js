var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');
var permissions = require("../libs/permissions");
var schemaTypes = require("../libs/schematypes");
var async = require('async');

var permissions = new permissions();
var permissionsEnum = permissions.getAccesibilityEnum();

var UserSchema = new mongoose.Schema({
    PassportCollection: [{
        Kind: String,
        Passport: {
            type: mongoose.Schema.ObjectId,
            refPath: 'PassportCollection.Kind'
        }
    }],
    DisplayName: {
        type: String,
        default: ''
    },
    DisplayPicture: {
        type: String,
        default: ''
    },
    Name: schemaTypes.nameSchema,
    Email: schemaTypes.emailSchema,
    Addresses: [schemaTypes.addressSchema],
    DOB: schemaTypes.dobSchema,
    Gender: schemaTypes.genderSchema,
    Role: schemaTypes.roleSchema,
    Title: {
        type: mongoose.Schema.ObjectId,
        ref: 'ItemTitles'
    },
    Background: {
        type: mongoose.Schema.ObjectId,
        ref: 'ItemBackgrounds'
    },
    IsConvenor: {
        type: Boolean,
        default: false
    },
    IsPrivate: {
        type: Boolean,
        default: false
    },
    Points: {
        type: Number,
        default: 0
    },
    Golds: {
        type: Number,
        default: 0
    },
    StudentNo: {
        type: String,
        default: ''
    }
    // At some point we'll need to move this somewhere else i think.
    // DeviceID: {
    //     GCM: String,
    //     APN: String
    // },
    // ConfirmedEmail: {
    //     type: Boolean,
    //     default: false
    // },
    // SecondaryUsers: [{
    //     type: mongoose.Schema.ObjectId,
    //     ref: "Users"
    // }]
}, {
    timestamps: true
});


var PermissionsSchema = new mongoose.Schema({
    User: {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
        required: true,
        index: true,
        unique: true
    },
    DisplayPicture: {
        type: permissions.getAccesibilitySchema(permissionsEnum.Public, true),
        default: permissions.getDefaultSchema(permissionsEnum.Public, true)
    },
    DisplayName: {
        type: permissions.getAccesibilitySchema(permissionsEnum.Public, true),
        default: permissions.getDefaultSchema(permissionsEnum.Public, true)
    },
    Name: {
        type: permissions.getAccesibilitySchema(),
        default: permissions.getDefaultSchema(permissionsEnum.Public, false)
    },
    Email: {
        type: permissions.getAccesibilitySchema(),
        default: permissions.getDefaultSchema(permissionsEnum.Public, false)
    },
    Addresses: {
        type: permissions.getAccesibilitySchema(),
        default: permissions.getDefaultSchema(permissionsEnum.Public, false)
    },
    DOB: {
        type: permissions.getAccesibilitySchema(),
        default: permissions.getDefaultSchema(permissionsEnum.Public, false)
    },
    Gender: {
        type: permissions.getAccesibilitySchema(),
        default: permissions.getDefaultSchema(permissionsEnum.Public, false)
    },
    Role: {
        type: permissions.getAccesibilitySchema(),
        default: permissions.getDefaultSchema(permissionsEnum.Public, false)
    },
    IsConvenor: {
        type: permissions.getAccesibilitySchema(),
        default: permissions.getDefaultSchema(permissionsEnum.Public, false)
    },
    Title: {
        type: permissions.getAccesibilitySchema(),
        default: permissions.getDefaultSchema(permissionsEnum.Public, false)
    },
    Background: {
        type: permissions.getAccesibilitySchema(),
        default: permissions.getDefaultSchema(permissionsEnum.Public, false)
    },
    StudentNo: {
        type: permissions.getAccesibilitySchema(),
        default: permissions.getDefaultSchema(permissionsEnum.Public, false)
    },
    IsPrivate: {
        type: permissions.getAccesibilitySchema(),
        default: permissions.getDefaultSchema(permissionsEnum.Public, false)
    }

}, {
    timestamps: true
});

var permissionModel = mongoose.model('UserPermission', PermissionsSchema, 'UserPermissions');

UserSchema.post('save', function() {

    var newUserPerm = new permissionModel();
    newUserPerm.User = this._id;
    newUserPerm.save();
});


var userModel = mongoose.model('Users', UserSchema, 'Users');



module.exports = {
    User: userModel,
    UserPermission: permissionModel
}