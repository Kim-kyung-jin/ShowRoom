const User=require('../model/Userdb');
const ObjectId = require('mongodb').ObjectID;

exports.getUserFindId = function(data) {
	return new Promise(function(resolve, reject) {
		User.findOne(data, function(err, result) {
			if(err)
				reject(new Error("err"));
			else if(result != null)
				reject(new Error("userId is Using"));
			else
				resolve("ok");
		});
	});
}

exports.saveUser = function(user) {
	return new Promise(function(resolve, reject) {
		user.save(function(err,result) {
			if(err)
				reject(new Error("save err"));
			else if(result == null)
				reject(new Error("save err"));
			else
				resolve(result);
		});
	});
}
exports.getUserFindObjectId = function(data) {
	return new Promise(function(resolve, reject) {
		User.findOne(data, function(err,result) {
			if(err)
				reject(new Error("err"));
			else if(result==null)
				reject(new Error("user is not Data"));
			else
				resolve(result);
		});
	});
}
exports.updateUserInfo = function(data, setdata) {
	return new Promise(function(resolve, reject) {
		User.update(data, setdata, function(err,result) {
			if(err)
				reject(new Error("err"));
			else if(result.nModified == 1)
				resolve(result);
			else
				reject(new Error("userInfo is not update"));
		});
	});
}

//========================================================================================
exports.updateUserPhoto=function(userObjectId,changePhoto,callback){
	User.update({_id:userObjectId},{"$set":{"userPhoto":changePhoto}},function(err,result){
		if(err)
			console.log(err);
		else if(result.nModified==1)
			callback(null,1);
		else
			callback(null,0);
	});
}
