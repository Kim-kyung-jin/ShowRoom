const User=require('../model/Userdb.js');
const bcrypt=require('../utils/bcrypt');
const jsonWebToken=require('../utils/jsonWebToken');
const nodemailer=require('../utils/nodemailer');
const config=require('config');
const ObjectId = require('mongodb').ObjectID;
const dbModel = require('../utils/dbOverlap');  
const moment=require('moment');
const multer = require('../utils/multers3.js');
const UserController=require('../utils/userController')
	  ,SelectBoardController=require('../utils/selectController')
	  ,BoardController=require('../utils/boardController.js');
moment.locale("ko");


var output=new Object();


exports.notification = async function(req,res,next){
	let page = req.query.page || 0;
	let notification = await dbModel.dbOverlap2('select * from notification  orders limit 10 offset ?',page)
	// return console.log(notification)
	res.send(notification)
}

//페북인증 및 가입
// passport.use(new FacebookStrategy({
// 	clientID:config.Customer.facebook.clientID,
// 	clientSecret:config.Customer.facebook.clientSecret,
// 	callbackURL:config.Customer.facebook.callbackURL,
// 	profileFields:config.Customer.facebook.profileFields
// 	},
// 	function(accessToken,refreshToken,profile,done){
// 		var user=new User();
// 		var providerData=profile._json;
// 		providerData.accessToken=accessToken;
// 		providerData.refreshToken=refreshToken;
// 		var providerUserProfile={
// 			id:profile.id,
// 			fullName:profile.displayName,
// 			email:providerData.email,
// 			username:profile.displayName,
// 			gender:profile.gender,
// 			provider:'facebook',
// 			accessToken:providerData.accessToken,
// 			refreshToken:providerData.refreshToken
// 		}
// 		user.userId=providerData.email;
// 		user.userPwd=bcrypt.hashPw(profile.id);
// 		user.userLoginType=providerUserProfile.provider;
// 		if(providerUserProfile.email==undefined){
// 			console.log("email정보없음");
// 			done(null);
// 		}
// 		else{
// 			UserController.getUserFindId(user.userId,function(err,result){
// 				if(err)
// 					console.log(err);
// 				else if(result!=0){
// 					console.log("not null!!!");
// 					return done(null,providerUserProfile);
// 				}
// 				else{
// 					console.log("nulll")
// 					UserController.saveUser(user,function(err,results){
// 						return done(null,providerUserProfile);
// 					});
// 				}
// 			});
// 		}
// 	}
// ));
// //구글인증 및 가입
// passport.use(new GoogleStrategy({
//     clientID:     config.Customer.google.clientID,
//     clientSecret: config.Customer.google.clientSecret,
//     callbackURL: config.Customer.google.callbackURL,
//     passReqToCallback   : true
//   },
//   function(request, accessToken, refreshToken, profile, done) {
//   		var user=new User();
//     	var providerData=profile._json;
// 		providerData.accessToken=accessToken;
// 		providerData.refreshToken=refreshToken;
// 		var providerUserProfile = {
//             fullName: profile.displayName,
//             email: providerData.emails[0].value,
//             username: profile.displayName,
//             gender:profile.gender,
//             provider: 'google',
//             accessToken:providerData.accessToken,
//             refreshToken:providerData.refreshToken
//         }
 
//         user.userId=providerUserProfile.email;
// 		user.userPwd=bcrypt.hashPw(profile.id);
// 		user.userLoginType=providerUserProfile.provider;
// 		//console.log(user);
//         if(providerUserProfile.email==undefined){
// 			console.log("email정보없음");
// 			done(null);
// 		}
// 		else{
// 			UserController.getUserFindId(user.userId,function(err,result){
// 				if(err)
// 					console.log(err);
// 				else if(result!=0){
// 					console.log("not null!!!");
// 					return done(null,providerUserProfile);
// 				}
// 				else{
// 					console.log("nulll")
// 					UserController.saveUser(user,function(err,results){
// 						return done(null,providerUserProfile);
// 					});
// 				}
// 			});
// 		}
//     }
// ));
// // serialize
// // 인증후 사용자 정보를 세션에 저장
// passport.serializeUser(function(user, done) {
//     console.log('serialize');

//     done(null, user);
// });

// // deserialize
// // 인증후, 사용자 정보를 세션에서 읽어서 request.user에 저장
// passport.deserializeUser(function(user, done) {
//     console.log('deserialize');
//     done(null,user);

// });

exports.success=function(req,res,next){
	res.json(req.user);
}



exports.test = async function (req,res,next){
	//console.log("userToken : "+req.body.userToken);
	let user = await jsonWebToken.TokenCheckexample(req.body.userToken);
	let userresult = await example123(user);
	res.status(200).json(userresult);
}


function example123(user) {
	return new Promise(function(resolve, reject){
		resolve({
			id:user.ObjectId
		});
	});
}
////////////////////////////////
//ShowRoom회원가입 Async/await
exports.addUser = async function(req,res,next) {
	try{
		let userIdCheckdata = { userId: req.body.userId };
		let userIdCheck = await UserController.getUserFindId(userIdCheckdata);
		let userToken;
		if(userIdCheck != "ok"){
			if(userIdCheck.userLoginType == req.body.userLoginType){
				userToken = await jsonWebToken.userTokenCreate(userIdCheck._id);
				output.msg = "success";
				output.data = null;
				res.setHeader("userToken", userToken);
			}
			else {
				output.msg = userIdCheck.userLoginType;
				output.data = null;
			}
			res.json(output);
		}
		else{
			let user = new User();
			if(req.body.userLoginType == 'showRoom'){
				if(req.file == undefined){
					user.userPhoto = "https://s3.ap-northeast-2.amazonaws.com/goallimage/origin/userPhoto/default/default.jpg";
					user.userPhotoKey = "notKey";
				}

				else{
					user.userPhoto = req.file.transforms[0].location;
					user.userPhotoKey = req.file.transforms[0].key;
				}
				user.userId = req.body.userId;
				user.userPwd = bcrypt.hashPw(req.body.userPwd);
				user.userLoginType = req.body.userLoginType;
				user.userName = req.body.userName;
				user.userSex = req.body.userSex;
				user.userAge = req.body.userAge;
				user.userPushToken = req.body.userPushToken;
				user.userLocal = req.body.userLocal;
				user.userDatetime = new moment().format("YYYY-MM-DD HH:mm:ss");
				user.userPushOnOff = 1;
			}
			else if(req.body.userLoginType == 'facebook'){
				let facebookuserAge = req.body.userAge.split('/');
				let currentyear = new moment().format("YYYY");
				let userAge = parseInt(currentyear)-parseInt(facebookuserAge[2]);
				user.userId = req.body.userId;
				user.userPwd = bcrypt.hashPw(req.body.userPwd);
				user.userLoginType = req.body.userLoginType;
				user.userName = req.body.userName;
				user.userPhoto = req.body.userPhoto;
				user.userPhotoKey = "notKey"
				user.userSex = req.body.userSex;
				user.userAge = userAge+1
				user.userPushToken = req.body.userPushToken;
				user.userLocal = req.body.userLocal;
				user.userDatetime = new moment().format("YYYY-MM-DD HH:mm:ss");
				user.userPushOnOff = 1;
			}
			else if(req.body.userLoginType == 'google'){
				user.userId = req.body.userId;
				user.userPwd = bcrypt.hashPw(req.body.userPwd);
				user.userLoginType = req.body.userLoginType;
				user.userName = req.body.userName;
				user.userPhoto = 'https://s3.ap-northeast-2.amazonaws.com/goallimage/origin/userPhoto/default/default.jpg';
				user.userPhotoKey = "notKey"
				user.userSex = req.body.userSex;
				user.userAge = req.body.userAge;
				user.userPushToken = req.body.userPushToken;
				user.userLocal = req.body.userLocal;
				user.userDatetime = new moment().format("YYYY-MM-DD HH:mm:ss");
				user.userPushOnOff = 1;
			}
			let userSave = await UserController.saveUser(user);
			userToken = await jsonWebToken.userTokenCreate(userSave._id);
			output.msg = "success";
			output.data = null;
			res.setHeader('userToken',userToken);
			res.json(output);
		}
	}catch(e) {
		if(req.file) {
			let deletePhoto = await multer.deleteFile([{Key: req.file.transforms[0].key}]);
		}
		output.msg = 'fail';
		output.data = e.message;
		console.log(output);
		res.setHeader('userToken',req.headers.usertoken);
		res.json(output);
	}
}
//로그인
exports.loginUser = async function(req,res,next) {
	try{
		let userIdCheckdata = { userId: req.body.userId };
		let userInfo = await UserController.getUserFindId(userIdCheckdata);
		if(userInfo == null) {
			output.msg = "fail";
			output.data = 'not Data';
			res.status(200).json(output);
		}
		else if(userInfo.userDelete == true){
			output.msg = "success";
			output.data = '탈퇴한아이디';
			res.status(200).json(output);
		}
		else if(userInfo.userLoginType == "facebook" || userInfo.userLoginType == "google"){
			output.msg = userInfo.userLoginType;
			output.data = null;
			res.status(200).json(output);
		}
		else{
			let setData = {"$set":{"userPushToken":req.body.userPushToken}};
			let loginResult = await bcrypt.hashPwCompare(req.body.userPwd,userInfo.userPwd);

			let userPushToken = await UserController.update(userIdCheckdata,setData);

			let userToken = await jsonWebToken.userTokenCreate(userInfo._id);
			output.msg = "success";
			output.data = null;
			res.setHeader('userToken',userToken);
			res.status(200).json(output);
		}
	}catch(e) {
		output.msg = 'fail';
		output.data = e.message;
		res.json(output);
	}
}
//유저정보 수정전 데이터 주기
exports.editUserView = async function(req, res, next) {
	try{
		let userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
		let userInfoquery = [
			{
				"$match": { _id: ObjectId(userToken.ObjectId)},
			},
			{
				"$project": {
					userId: 1,
					userName: 1,
					userAge: 1,
					userSex: 1,
					userLocal: 1,
					userLoginType: 1,
					userPhoto: 1
				}
			}
		]
		let userInfo = await UserController.userEditAggregate(userInfoquery);
		output.msg = "success";
		output.data = userInfo;
		res.setHeader('userToken',userToken.userToken);
		res.status(200).json(output);
	}catch(e) {
		output.msg = 'fail';
		output.data = e.message;
		res.setHeader('userToken',req.headers.usertoken);
		res.json(output);
	}
}
exports.editUser = async function(req, res, next) {
	try{
		let userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
		let userIdCheckdata = { _id: userToken.ObjectId };
		let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
		let userUpdatequery;
		if(req.file == undefined){
			if(userInfo.userPhoto == req.body.userPhoto){
				userUpdatequery = {
					"$set": {
						userName: req.body.userName, 
						userAge: req.body.userAge, 
						userSex: req.body.userSex,
						userLocal: req.body.userLocal
					}
				}
			}
			else if(req.body.userPhoto == "default"){
				let defaultUserPhoto = "https://s3.ap-northeast-2.amazonaws.com/goallimage/origin/userPhoto/default/default.jpg";
				let defaultUserPhotoKey = "notKey";
				userUpdatequery = {
					"$set": {
						userName: req.body.userName, 
						userAge: req.body.userAge, 
						userSex: req.body.userSex,
						userLocal: req.body.userLocal,
						userPhoto: defaultUserPhoto,
						userPhotoKey: defaultUserPhotoKey
					}
				}
				if(userInfo.userPhotoKey != "notKey")
					await multer.deleteFile([{Key: userInfo.userPhotoKey}]);
			}
		}
		else {
			userUpdatequery = {
					"$set": {
						userName: req.body.userName, 
						userAge: req.body.userAge, 
						userSex: req.body.userSex,
						userLocal: req.body.userLocal,
						userPhoto: req.file.transforms[0].location,
						userPhotoKey: req.file.transforms[0].key
					}
				}
			if(userInfo.userPhotoKey != "notKey")
				await multer.deleteFile([{Key: userInfo.userPhotoKey}]);
		}

		let userUpdate = await UserController.editUser(userIdCheckdata, userUpdatequery);
		output.msg="success";
		output.data = null;
		res.setHeader('userToken',userToken.userToken);
		res.status(200).json(output);
	}catch(e) {
		if(req.file) {
			let deletePhoto = await multer.deleteFile([{Key: req.file.transforms[0].key}]);
		}
		output.msg = 'fail';
		output.data = e.message;
		res.setHeader('userToken',req.headers.usertoken);
		res.json(output);
	}
}
//비밀번호 변경전 확인
exports.userPwdChangeCheck = async function(req,res,next) {
	try{
		let userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
		let userIdCheckdata = { _id: userToken.ObjectId };
		let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
		let loginResult = await bcrypt.hashPwCompare(req.body.userPwd,userInfo.userPwd);
		output.msg = "success";
		output.data = null;
		res.setHeader('userToken',userToken.userToken);
		res.status(200).json(output);
	}catch(e) {
		output.msg = 'fail';
		output.data = e.message;
		res.setHeader('userToken',req.headers.usertoken);
		res.json(output);
	}
}
//비밀번호 변경
exports.userPwdChange = async function(req,res,next) {
	try{
		let userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
		let userIdCheckdata = { _id: userToken.ObjectId };
		let userUpdatequery;
		userUpdatequery = {
			"$set": {
				userPwd: bcrypt.hashPw(req.body.userPwd)
			}
		}
		let userUpdate = await UserController.editUser(userIdCheckdata, userUpdatequery);
		output.msg = "success";
		output.data = null;
		res.setHeader('userToken',userToken.userToken);
		res.status(200).json(output);
	}catch(e) {
		output.msg = 'fail';
		output.data = e.message;
		res.setHeader('userToken',req.headers.usertoken);
		res.json(output);
	}

}


//유저아이디체크
exports.checkUserId = async function(req,res,next) {
	let userIdCheckdata = { userId: req.body.userId };
	let userInfo = await UserController.getUserFindId(userIdCheckdata);
	output.msg = "success";
	output.data = "사용가능한아이디!!";
	res.json(output);

}
//회원탈퇴
exports.outUser = async function(req,res,next) {
	try{
		let userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
		let userIdCheckdata = { _id: userToken.ObjectId };
		let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
		let updateUserDeletequery = {"$set": {"userDelete": true}};
		let updateUserDelete = await UserController.updateUserInfo(userIdCheckdata,updateUserDeletequery);
		output.msg = "success";
		output.data = null;
		res.json(output);
	}catch(e) {
		output.msg = 'fail';
		output.data = e.message;
		res.json(output);
	}
}
//푸시온오프 데이터주기
exports.pushOnOffData = async function(req, res, next) {
	try{
		let userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
		let userIdCheckdata = { _id: userToken.ObjectId };
		let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
		output.msg = "success",
		output.data = {
			userPushOnOff: userInfo.userPushOnOff
		};
		res.setHeader('userToken', userToken.userToken);
		res.json(output);
	}catch(e) {
		output.msg = 'fail';
		output.data = e.message;
		res.setHeader('userToken',req.headers.usertoken);
		res.json(output);
	}
}
//푸시온오프
exports.pushOnOff = async function(req,res,next) {
	try{
		let userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
		let userIdCheckdata = { _id: userToken.ObjectId };
		let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
		let updateUserPushOnOffData = {"$set":{"userPushOnOff": !userInfo.userPushOnOff}};
		let updateUserPushOnOff = await UserController.updateUserInfo(userIdCheckdata,updateUserPushOnOffData);
		output.msg = "success";
		output.data = null;
		res.setHeader('userToken',userToken.userToken);
		res.json(output);
	}catch(e) {
		output.msg = 'fail';
		output.data = e.message;
		res.setHeader('userToken',req.headers.usertoken);
		res.json(output);
	}
}


//비밀번호 재설정 
exports.joinshop=function(req,res,next){
	console.log(req.body.shopName);
	var shopInfo = {
		shopName: req.body.shopName,
		shopAddress: req.body.shopAddress,
		shopUrl: req.body.shopUrl,
		shopEmail: req.body.shopEmail,
		shopAdminName: req.body.shopAdminName,
		shopAdminPhone: req.body.shopAdminPhone
	}
	console.log(shopInfo);
	nodemailer.joinshop(shopInfo,function(err,result){
		if(result==1){
			res.json("success");
		}else{
			res.json("fail")
		}
	});
}


//게시판내글보기
exports.boardMyPost=function(req,res,next){
	
}





// exports.facebookLogin=passport.authenticate('facebook',{scope:['public_profile','email']});
// exports.facebookcallback=passport.authenticate('facebook',{successRedirect:'/success',failureRedirect:'/fail'});
// exports.googleLogin=passport.authenticate('google',{scope:['https://www.googleapis.com/auth/plus.login',
// 														   'https://www.googleapis.com/auth/plus.profile.emails.read']});
// exports.googlecallback=passport.authenticate('google',{successRedirect:'/success',failureRedirect:'/fail'});

