var async = require('async');
var mongoose = require("mongoose");
var user = require("../../model/user.model").User;
var userPermission = require("../../model/user.model").UserPermission;

var permissions = require("../permissions");

var permissions = new permissions();
var permissionsEnum = permissions.getAccesibilityEnum();
var permRelations = permissions.getRelationObject();

var UserCommon = {};

UserCommon.checkExists = function(UserID, callback) {
    user.findOne({
        _id: UserID
    }, function(err, doc) {
        if (err)
            return callback(err);

        if (doc)
            return callback(null, doc);
        else
            return callback("No User Found");
    });
}

UserCommon.checkPermissionExists = function(User, callback) {

    if (typeof User === 'string')
        User = {
            _id: User
        };

    userPermission.findOne({
        User: User._id
    }, function(err, doc) {
        if (err)
            return callback(err);

        if (doc) {
            return callback(null, doc, User);
        } else {
            var newUserPerm = new userPermission();
            newUserPerm.User = User._id;
            newUserPerm.save(function(err, permission) {
                if (err)
                    return callback(err);

                callback(null, permission, User);
            });
        }
    });
}

UserCommon.updateUser = function(UserID, Obj, callback) {
    async.waterfall([
        async.apply(UserCommon.checkExists, UserID),
        UserCommon.checkPermissionExists,
        function(permission, user, callback) {
            async.parallel([
                    function(callback) {

                        for (var key in Obj.Permissions) {
                            if (!Obj.Permissions.hasOwnProperty(key))
                                continue;

                            if (permission[key] === undefined)
                                permission[key] = {};

                            if (permission[key].Static == false) {
                                permission[key].Permission = Obj.Permissions[key];
                            }
                        }

                        permission.save(function(err, doc) {
                            if (err)
                                return callback(err);

                            callback();
                        });

                    },
                    function(callback) {
                        for (var key in Obj.Data) {
                            if (!Obj.Data.hasOwnProperty(key)) {
                                continue;
                            }

                            if (!Obj.Data[key])
                                continue;

                            user[key] = Obj.Data[key];
                        }

                        user.save(function(err, doc) {
                            if (err)
                                return callback(err);

                            callback();
                        });
                    }
                ],
                // optional callback
                function(err, results) {
                    if (err)
                        return callback(err);

                    callback();
                });
        }
    ], function(err, results) {
        if (err)
            return callback(err);

        callback();
    });
}

// Currently does nothing
UserCommon.checkRelation = function(UserID, OtherUserID, callback) {

    // If they are friends, return 

    if (UserID == OtherUserID)
        return callback(null, permRelations.All);

    if (true)
        return callback(null, permRelations.Public);

    //return callback(null, permRelations.Private);

    //return callback(null, permRelations.Public);

}


UserCommon.getAllUsers = function(RequesterUserID, ids, callback) {

    async.waterfall([
        async.apply(UserCommon.checkExists, RequesterUserID),
        UserCommon.checkPermissionExists,
        function(permission, userObj, callback) {
            var selectionString = "";

            permission = permission.toObject();
            for (var key in permission) {

                if (!permission.hasOwnProperty(key) || permission[key].Permission === undefined)
                    continue;

                selectionString += key + " ";
            }

            if (selectionString.length == 0)
                return callback();

            if(ids.length==0) {
                user
                    .find()
                    .select(selectionString)
                    .exec(function(err, docs) {
                        if (err)
                            return callback(err);

                        if (docs) {
                            return callback(null, docs);
                        } else
                            return callback("No User Found");
                    });
            } else {
                user
                    .find({ _id: { $in: ids }})
                    .select(selectionString)
                    .exec(function(err, docs) {
                        if (err)
                            return callback(err);

                        if (docs) {
                            return callback(null, docs);
                        } else
                            return callback("No User Found");
                    });
            }
        },

    ], function(err, users) {
        if (err)
            return callback(err);

        callback(null, users);
    });

}


UserCommon.getUser = function(RequesterUserID, UserID, callback) {

    async.waterfall([
        async.apply(UserCommon.checkExists, UserID),
        UserCommon.checkPermissionExists,
        function(permission, userObj, callback) {
            UserCommon.checkRelation(RequesterUserID, UserID, function(err, relation) {
                var selectionString = "";

                permission = permission.toObject();
                for (var key in permission) {

                    if (!permission.hasOwnProperty(key) || permission[key].Permission === undefined)
                        continue;

                    if (relation.indexOf(permission[key].Permission) > -1)
                        selectionString += key + " ";
                }

                if (selectionString.length == 0)
                    return callback();

                user
                    .findOne({
                        _id: UserID
                    })
                    .select(selectionString)
                    .exec(function(err, doc) {
                        if (err)
                            return callback(err);

                        if (doc) {
                            return callback(null, doc);
                        } else
                            return callback("No User Found");
                    });
            });
        },

    ], function(err, user) {
        if (err)
            return callback(err);

        callback(null, user);
    });

}

UserCommon.searchDisplaynameOrEmail = function(RequesterUserID, searchString, limit, skip, callback) {

    async.waterfall([
            function(callback) {
                user
                    .aggregate([{
                        $match: {
                            "DisplayName": {
                                "$regex": searchString,
                                "$options": "i"
                            }
                        }
                    }, {
                        $sort: {
                            "DisplayName": -1
                        }
                    }, {
                        $skip: skip
                    }, {
                        $limit: limit
                    }])
                    .exec(function(err, docs) {
                        if (err) {
                            return callback(err);
                        }

                        return callback(null, docs);
                    });
            },
            function(users, callback) {
                console.log(users);
                var processedUsers = [];
                async.each(users, function(user, callback) {

                    UserCommon.checkPermissionExists(user, function(err, permission, user) {
                        if (err) {
                            return callback(err);
                        }

                        if (user._id == RequesterUserID)
                            return callback();

                        UserCommon.checkRelation(RequesterUserID, user, function(err, relation) {
                            var userObj = user;

                            if (err)
                                return callback(err);

                            var selectionString = "";
                            permission = permission.toObject();

                            for (var key in user) {

                                if (!user.hasOwnProperty(key))
                                    continue;

                                if (permission[key] !== undefined && permission[key].Permission !== undefined && relation.indexOf(permission[key].Permission) > -1) {
                                    //console.log(key);
                                    //console.log(permission[key].Permission);
                                } else {
                                    if (key != "_id") {
                                        //console.log("Stripping property: ", key);
                                        userObj[key] = undefined;
                                    }
                                }
                            }

                            processedUsers.push(userObj);

                            return callback();
                        });
                    });


                }, function(err) {
                    // if any of the file processing produced an error, err would equal that error
                    if (err) {
                        console.log(err);
                        callback(err);
                    } else {
                        console.log('All files have been processed successfully');

                        callback(null, processedUsers);
                    }
                });



            },

        ],
        function(err, docs) {
            if (err) {
                console.log(err);
                return callback(err);
            }

            callback(null, docs);
        });

}

module.exports = UserCommon;