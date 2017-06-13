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
		if(userToken == null) 
			reject(new Error("err"))
		else
			resolve(userToken);
	});
}



//Token값 체크
// exports.TokenCheck=function(token,callback){
// 	var decodeToken=crypto.decrypt(token);
// 	var originalDecoded=jwt.decode(decodeToken,{complete:true}); 
// 	var DateNow=Math.round(Date.now()/1000);
// 	if(originalDecoded==null)
// 		callback(null,0);
// 	else{
// 		if(originalDecoded.payload.exp<=DateNow){
// 			var userToken=TokenCreate(originalDecoded.payload.id);

// 			var userInfo={
// 				ObjectId:originalDecoded.payload.id,
// 				userToken:cryptedToken
// 			}
// 			callback(null,userInfo);
// 		}
// 		else{
// 			var userInfo={
// 				ObjectId:originalDecoded.payload.id,
// 				userToken:token
// 			}
// 			callback(null,userInfo);
// 		}
// 	}
// }
exports.TokenCheck = function(token){
	return new Promise(function(resolve,reject){
		let decodeToken = crypto.decrypt(token);
		if(decodeToken==false){
			reject(new Error("Token fail"));
		}
		else{
			let originalDecoded = jwt.decode(decodeToken, {complete:true});
			let DateNow = Math.round(Date.now()/1000);
			if(originalDecoded == null) { 
				reject(new Error("Token fail"));
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