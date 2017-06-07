module.exports = {
  count: function(obj) {
    return Object.keys(obj).length;
  },

  constructErrorResponse: function(errorCode, errorMessage, StatusCode) {
    if (StatusCode === undefined) {
      StatusCode = 200;
    }
    var errorResponseCode = {}
    errorResponseCode.code = StatusCode;
    errorResponseCode.ERR_CODE = errorCode;
    errorResponseCode.message = errorMessage;

    return errorResponseCode;
  },

  ComposeJSONResponse: function(err) {
    var Code = 200;
    var Err_Code = "ERR_NONE";
    var Message = "Success";


    if (err) {
      Code = (err.code === undefined) ? 500 : err.code;
      Err_Code = (err.ERR_CODE === undefined) ? "ERR_UNKNOWN" : err.ERR_CODE;
      Message = (err.message === undefined) ? "Something Went Wrong" : err.message;
    }

    var composedData = {};
    composedData.code = Code;
    composedData.response = {
      "ERR_CODE": Err_Code,
      "Message": Message
    };

    return composedData;
  },

  isValidObjectId: function(stringID) {
    if (PrimaryUser.match(/^[0-9a-fA-F]{24}$/)) {
      return true;
    } else {
      return false;
    }
  },
  sort_by: function(field, reverse, primer) {

    var key = primer ?
      function(x) {
        return primer(x[field])
      } :
      function(x) {
        return x[field]
      };

    reverse = !reverse ? 1 : -1;

    return function(a, b) {
      return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    }
  },
  toLowerCase: function(StringArray) {
    if (StringArray === undefined)
      return undefined;

    var newArray = [];
    for (var i = 0; i < StringArray.length; i++) {
      newArray.push(StringArray[i].toString().toLowerCase());
    }
    return newArray;
  }



};