const async=require('async');
const jwt=require('jsonwebtoken');
const secretKey="iu";
const UserController=require('../utils/userController');
const crypto=require('./crypto');

//Token값 만드는 함수 
var TokenCreate=function(objectId){
	var Token=jwt.sign({
		id:objectId
	},secretKey,{
		expiresIn:'1M'
	});
	var cryptedToken=crypto.encrypt(Token);
	return cryptedToken;
}
exports.userTokenCreate = function(objectId) {
	return new Promise(function(resolve, reject) {
		let userToken = TokenCreate(objectId);
		resolve(userToken);
	});
}

exports.TokenCheck = function(token){
	return new Promise(function(resolve,reject){
		let decodeToken = crypto.decrypt(token);
		if(decodeToken==false){
			reject(new Error("fail1"));
		}
		else{
			let originalDecoded = jwt.decode(decodeToken, {complete:true});
			let DateNow = Math.round(Date.now()/1000);
			if(originalDecoded == null) { 
				reject(new Error("fail2"));
			}
			else {
				if(originalDecoded.payload.exp <= DateNow) {
					
					let userToken = TokenCreate(originalDecoded.payload.id);
					
					let userInfo = {
						ObjectId:originalDecoded.payload.id,
						userToken:userToken
					}
					resolve(userInfo);
				}
				else {
					
					let userInfo = {
						ObjectId:originalDecoded.payload.id,
						userToken:token
					}
					resolve(userInfo);
				}
			}	
		}
	});
}