const User=require('../model/Userdb');
const ObjectId = require('mongodb').ObjectID;
exports.getUserFindId = function(data) {
	return new Promise(function(resolve, reject) {
		User.findOne(data, function(err, result) {
			if(err)
				reject(new Error("err"));
			else if(result != null)
				resolve(result);
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
exports.editUser = function(data, setdata) {
	return new Promise(function(resolve, reject) {
		User.findOneAndUpdate(data, setdata, {new: true}, function(err,result) {
			if(err)
				reject(new Error("err"));
			else if(result == null)
				reject(new Error("user update error"));
			else
				resolve(result);
		});
	});
}

exports.userAggregate = function(data) {
	return new Promise(function(resolve, reject) {
		User.aggregate(data, function(err, result) {
			if(err)
				reject(new Error("err"));
			else if(result == 0)
				reject(new Error("user is not data"));
			else{
				let array = [];
				let bagArray = [];
				array = result[0].userCodyTagarray.concat(result[0].userCategoryarray);
				result[0].userCodyMybag.forEach(function(results) {
					bagArray.push(ObjectId(results));
				});
				let userInfo = {
					userFavorite: array,
					userLocal: result[0].userLocal,
					userCodyMybag: bagArray
				}
				resolve(userInfo);
			}
		});
	});
}
exports.userEditAggregate = function(data) {
	return new Promise(function(resolve, reject) {
		User.aggregate(data, function(err, result) {
			if(err)
				reject(new Error("err"));
			else if(result == null)
				reject(new Error("user is not Data"));
			else
				resolve(result[0]);
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
exports.getUserFindObjectIdToken = function(data, userPushToken) {
	return new Promise(function(resolve, reject) {
		User.findOne(data, function(err,result) {
			if(err)
				reject(new Error("err"));
			else if(result==null)
				reject(new Error("user is not Data"));
			else{
				result.userPushA = userPushToken;
				result.save();
				resolve(result);
			}
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

exports.updateUserToken=function(ObjectId,userToken,callback){
	User.update({_id:ObjectId},{"$set":{"userToken":userToken}},function(err,result){
		if(err)
			console.log(err);
		else if(result.nModified==1)
			callback(null,1);
		else
			callback(null,0);
		console.log(result);
	});
}

exports.updateUserName=function(userObjectId,changeName,callback){
	User.update({_id:userObjectId},{"$set":{"userName":changeName}},function(err,result){
		if(err)
			console.log(err);
		else if(result.nModified==1)
			callback(null,1);
		else
			callback(null,0);
	});
}
exports.updateUserAge=function(userObjectId,changeAge,callback){
	console.log(userObjectId);
	User.update({_id:userObjectId},{"$set":{"userAge":changeAge}},function(err,result){
		console.log(result);
		if(err)
			console.log(err);
		else if(result.nModified==1)
			callback(null,1);
		else
			callback(null,0);
	});
}
exports.UpdateUserLocation=function(userObjectId,changeLocation,callback){
	
	User.update({_id:userObjectId},{"$set":{"userLocal":changeLocation}},function(err,result){
		if(err)
			console.log(err);
		else if(result.nModified==1)
			callback(null,1);
		else
			callback(null,0);
	});
}
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
exports.updateUserPushOnOff=function(userObjectId,pushOnOff,callback){
	User.update({_id:userObjectId},{"$set":{"userPushOnOff":pushOnOff}},function(err,result){
		if(err)
			console.log(err);
		else if(result.nModified==1)
			callback(null,1);
		else
			callback(null,0);
	});
}

exports.update = function(data, setdata) {
	return new Promise(function(resolve, reject) {
		User.findOneAndUpdate(data, setdata, { new: true} ,function(err,result){
			if(err)
				reject(new Error("err"));
			else if(result == null)
				reject("user update error");
			else{
				resolve(result);
			}

		});
	});
}