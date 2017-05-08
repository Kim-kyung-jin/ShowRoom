const User=require('../model/Userdb.js');
const bcrypt=require('../utils/bcrypt');
const jsonWebToken=require('../utils/jsonWebToken');
const nodemailer=require('../utils/nodemailer');
const config=require('config');
const async=require('async');
const base64=require('base-64');
const passport=require('passport')
	  ,FacebookStrategy=require('passport-facebook').Strategy
	  ,GoogleStrategy=require('passport-google-oauth').OAuth2Strategy;
const fs=require('fs');
const ObjectId = require('mongodb').ObjectID;
const moment=require('moment');
const UserController=require('../utils/userController')
	  ,SelectBoardController=require('../utils/selectController')
	  ,BoardController=require('../utils/boardController.js');
moment.locale("ko");


var output=new Object();









//페북인증 및 가입
passport.use(new FacebookStrategy({
	clientID:config.Customer.facebook.clientID,
	clientSecret:config.Customer.facebook.clientSecret,
	callbackURL:config.Customer.facebook.callbackURL,
	profileFields:config.Customer.facebook.profileFields
	},
	function(accessToken,refreshToken,profile,done){
		var user=new User();
		var providerData=profile._json;
		providerData.accessToken=accessToken;
		providerData.refreshToken=refreshToken;
		var providerUserProfile={
			id:profile.id,
			fullName:profile.displayName,
			email:providerData.email,
			username:profile.displayName,
			gender:profile.gender,
			provider:'facebook',
			accessToken:providerData.accessToken,
			refreshToken:providerData.refreshToken
		}
		user.userId=providerData.email;
		user.userPwd=bcrypt.hashPw(profile.id);
		user.userLoginType=providerUserProfile.provider;
		if(providerUserProfile.email==undefined){
			console.log("email정보없음");
			done(null);
		}
		else{
			UserController.getUserFindId(user.userId,function(err,result){
				if(err)
					console.log(err);
				else if(result!=0){
					console.log("not null!!!");
					return done(null,providerUserProfile);
				}
				else{
					console.log("nulll")
					UserController.saveUser(user,function(err,results){
						return done(null,providerUserProfile);
					});
				}
			});
		}
	}
));
//구글인증 및 가입
passport.use(new GoogleStrategy({
    clientID:     config.Customer.google.clientID,
    clientSecret: config.Customer.google.clientSecret,
    callbackURL: config.Customer.google.callbackURL,
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
  		var user=new User();
    	var providerData=profile._json;
		providerData.accessToken=accessToken;
		providerData.refreshToken=refreshToken;
		var providerUserProfile = {
            fullName: profile.displayName,
            email: providerData.emails[0].value,
            username: profile.displayName,
            gender:profile.gender,
            provider: 'google',
            accessToken:providerData.accessToken,
            refreshToken:providerData.refreshToken
        }
 
        user.userId=providerUserProfile.email;
		user.userPwd=bcrypt.hashPw(profile.id);
		user.userLoginType=providerUserProfile.provider;
		//console.log(user);
        if(providerUserProfile.email==undefined){
			console.log("email정보없음");
			done(null);
		}
		else{
			UserController.getUserFindId(user.userId,function(err,result){
				if(err)
					console.log(err);
				else if(result!=0){
					console.log("not null!!!");
					return done(null,providerUserProfile);
				}
				else{
					console.log("nulll")
					UserController.saveUser(user,function(err,results){
						return done(null,providerUserProfile);
					});
				}
			});
		}
    }
));
// serialize
// 인증후 사용자 정보를 세션에 저장
passport.serializeUser(function(user, done) {
    console.log('serialize');

    done(null, user);
});

// deserialize
// 인증후, 사용자 정보를 세션에서 읽어서 request.user에 저장
passport.deserializeUser(function(user, done) {
    console.log('deserialize');
    done(null,user);

});

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
	let userIdCheckdata = { userId: req.body.userId };
	let userIdCheck = await UserController.getUserFindId(userIdCheckdata);
	let user = new User();
	let PhotoFile = req.files;

	user.userId = req.body.userId;
	user.userPwd = bcrypt.hashPw(req.body.userPwd);
	user.userLoginType = 'showRoom';
	user.userName = req.body.userName;
	user.userAge = req.body.userAge;
	user.userLocal = req.body.userLocal;
	user.userDatetime = new moment().format("YYYY-MM-DD HH:mm:ss");
	user.userPushOnOff = 1;

	if(PhotoFile[0]==null)
		user.userPhoto=config.Customer.imageurl+'/uploads/userPhoto/default_image.png';
	else {
		let strArray=PhotoFile[0].path.split('/');
		user.userPhoto=config.Customer.imageurl+'/'+strArray[1]+'/'+strArray[2]+'/'+strArray[3]+'/'+strArray[4];
	}

	let userSave = await UserController.saveUser(user);
	let userToken = await jsonWebToken.userTokenCreate(userSave._id);
	
	
	output.msg = "success";
	output.data = {
		userToken: userToken
	};

	res.json(output);
	
}
//로그인
exports.loginUser = async function(req,res,next) {
	let userIdCheckdata = { userId: req.body.userId };
	let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
	let loginResult = await bcrypt.hashPwCompare(req.body.userPwd,userInfo.userPwd);
	let userToken = await jsonWebToken.userTokenCreate(userInfo._id);

	output.msg = "success";
	output.data = {
		userToken: userToken
	}
	res.status(200).json(output);
}
//유저아이디체크
exports.checkUserId = async function(req,res,next) {
	let userIdCheckdata = { userId: req.body.userId };
	let userInfo = await UserController.getUserFindId(userIdCheckdata);
	output.msg = "success";
	output.data = "사용가능한아이디!!";
	res.json(output);
}
//유저 비밀번호 변경
exports.changeUserPwd = async function(req,res,next) {
	let userToken = await jsonWebToken.TokenCheck(req.body.userToken);
	let userIdCheckdata = { _id: userToken.ObjectId };
	let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
	let userPwdResult = await bcrypt.hashPwCompare(req.body.userPwd,userInfo.userPwd);
	let changePwd = bcrypt.hashPw(req.body.userNewPwd);
	let updateUserPwdData = {"$set":{"userPwd":changePwd}};
	let updateUserPwd = await UserController.updateUserInfo(userIdCheckdata,updateUserPwdData);
	output.msg = "success";
	output.data = "비밀번호변경 완료";
	res.json(output);
}
//유저이름 변경
exports.changeUserName = async function(req,res,next) {
	let userToken = await jsonWebToken.TokenCheck(req.body.userToken);
	let userIdCheckdata = { _id: userToken.ObjectId };
	let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
	let changeName = req.body.userChangeName;
	let updateUserNameData = {"$set":{"userName":changeName}};
	let updateUserName = await UserController.updateUserInfo(userIdCheckdata,updateUserNameData);
	output.msg = "success";
	output.data = {
		userToken: userToken.userToken,
		msg: "이름바꾸기 성공"
	}
	res.json(output);
}
//유저이름 변경
exports.changeUserAge = async function(req,res,next) {
	let userToken = await jsonWebToken.TokenCheck(req.body.userToken);
	let userIdCheckdata = { _id: userToken.ObjectId };
	let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
	let changeAge = req.body.userChangeAge;
	let updateUserAgeData = {"$set":{"userAge":changeAge}};
	let updateUserAge = await UserController.updateUserInfo(userIdCheckdata,updateUserAgeData);
	output.msg = "success";
	output.data = {
		userToken: userToken.userToken,
		msg: "나이바꾸기 성공"
	}
	res.json(output);
}
//유저이름 변경
exports.changeUserLocation = async function(req,res,next) {
	let userToken = await jsonWebToken.TokenCheck(req.body.userToken);
	let userIdCheckdata = { _id: userToken.ObjectId };
	let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
	let changeLocation = req.body.userChangeLocation;
	let updateUserLocationData = {"$set":{"userLocal":changeLocation}};
	let updateUserLocation = await UserController.updateUserInfo(userIdCheckdata,updateUserLocationData);
	output.msg = "success";
	output.data = {
		userToken: userToken.userToken,
		msg: "지역바꾸기 성공"
	}
	res.json(output);
}
///////////////////////////////////////////////////////////////////////////////////////////////
//ShowRoom회원가입
// exports.addUser=function(req,res,next){
// 	var user=new User();
// 	var PhotoFile=req.files;
// 	var current_time=new moment().format("YYYY-MM-DD HH:mm:ss");
	
// 	user.userId=req.body.userId;
// 	user.userPwd=bcrypt.hashPw(req.body.userPwd);
// 	user.userLoginType='showRoom';
// 	user.userName=req.body.userName;
// 	user.userAge=req.body.userAge;
// 	user.userLocal=req.body.userLocal;
// 	user.userDatetime=current_time;
// 	user.updateUserPushOnOff=1;

// 	if(PhotoFile[0]==null){
// 		user.userPhoto=config.Customer.imageurl+'/uploads/userPhoto/default_image.png';
// 	}
// 	else{
// 		var strArray=PhotoFile[0].path.split('/');
// 		user.userPhoto=config.Customer.imageurl+'/'+strArray[1]+'/'+strArray[2]+'/'+strArray[3]+'/'+strArray[4];
// 	}



// 	//user.userPhoto=config.Customer.imageurl+'/uploads/'+PhotoFile[0].fieldname+'/'+PhotoFile[0].filename;
// 	
// 		//base64 기본 
// 		var userToken1=base64.encode("5881f0cada7f0728c9551521");
// 		console.log("userToken1 : "+userToken1);
// 		var userToken2=base64.decode(userToken1);
// 		console.log("userToken2 : "+userToken2);
// 	
	
// 	
// 		//유저정보 추가
// 		user.userPhoto=config.Customer.imageurl+'/uploads/userPhoto/default_image.png';
// 		user.userAge=req.body.userAge;
// 		user.userName=req.body.userName;
// 		user.userLocal=req.body.userLocal;
// 		user.userDatetime=Date.now();
// 		//프로필 수정할때 
// 		user.userPhoto=config.Customer.imageurl+'/uploads/'+PhotoFile[0].fieldname+'/'+PhotoFile[0].filename;
// 	

// 	async.waterfall([
// 			function(callback){
// 				UserController.getUserFindId(user.userId,function(err,result){
// 					if(err)
// 						console.log(err);
// 					else if(result==0)
// 						callback(null,0,0);
// 					else
// 						callback(null,result,1);
// 				});
// 			},
// 			function(userInfo,userCheck,callback){
// 				if(userInfo==0){
// 					UserController.saveUser(user,function(err,result){
// 						if(err)
// 							console.log(err);
// 						else
// 							callback(null,result,userCheck);
// 					});
// 				}
// 				else
// 					callback(null,userInfo,userCheck);
// 			},
// 			function(userInfo,userCheck,callback){
// 				if(userCheck==0){
// 					var userToken=jsonWebToken.TokenCreate(userInfo._id);
// 					callback(null,userToken,userInfo,userCheck);
// 				}
// 				else
// 					callback(null,0,userInfo,userCheck);
// 			}
// 		],function(err,userToken,userInfo,userCheck){
// 			if(userCheck==0){
// 				output.msg="success";
// 				output.data=userInfo;
// 				output.userToken=userToken;
// 				res.json(output);
// 			}
// 			else{
// 				var strArray=user.userPhoto.split('/');
// 				console.log(strArray[5]);
// 				if(strArray[5]=='default_image.png'){
// 					output.msg="success";
// 					output.data={
// 						userLoginType:userInfo.userLoginType,
// 						msg:"비밀번호 재설정"
// 					}
// 					res.json(output);
// 				}
// 				else{
// 					fs.unlink(PhotoFile[0].path,function(err){
// 						if(err)
// 							console.log(err);
// 					});
// 					output.msg="success";
// 					output.data={
// 						userLoginType:userInfo.userLoginType,
// 						msg:"비밀번호 재설정"
// 					}
// 					res.json(output);
// 				}
// 			}
// 		});

// }
///////////////////////////////////////////////////////////////////////////////////////////////



//수정필요
//로그인
// exports.loginUser=function(req,res,next){
// 	var user=new User();
// 	user.userId=req.body.userId;
// 	user.userPwd=req.body.userPwd;
// 	async.waterfall([
// 			function(callback){
// 				UserController.getUserFindId(user.userId,function(err,result){
// 					if(err)
// 						console.log(err);
// 					else
// 						callback(null,result);
// 				});
// 			},
// 			function(userInfo,callback){
// 				if(userInfo==0)
// 					callback(null,0);
// 				else{
// 					bcrypt.hashPwCompare(user.userPwd,userInfo.userPwd,function(err,result){
// 						if(err)
// 							console.log(err);
// 						else if(result==1)
// 							callback(null,"로그인 성공");
// 						else
// 							callback(null,"로그인 실패");
// 					});
// 				}
// 			}
// 		],function(err,loginResult){
// 			if(err)
// 				console.log(err);
// 			else{
// 				output.msg="success";
// 				output.data=loginResult;
// 				res.json(output);
// 			}
// 		});
// }


// //유저아이디체크
// exports.checkUserId=function(req,res,next){
// 	var checkUserId=req.body.userId;

// 	UserController.getUserFindId(req.body.userId,function(err,result){
// 		if(err)
// 			console.log(err);
// 		else if(result==0){
// 			output.msg="success";
// 			output.data="아이디 사용 가능";
// 			res.json(output);
// 		}
// 		else{
// 			output.msg="success";
// 			output.data="아이디 사용 불가능";
// 			res.json(output);
// 		}
// 	});
// }


//수정완료
//유저 비밀번호 변경
// exports.changeUserPwd=function(req,res,next){
// 	async.waterfall([
// 			function(callback){
// 				jsonWebToken.TokenCheck(req.body.userToken,function(err,result){
// 					if(err)
// 						console.log(err);
// 					else
// 						callback(null,result);
// 				});
// 			},
// 			function(userTokenInfo,callback){
// 				UserController.getUserFindObjectId(userTokenInfo.ObjectId,function(err,result){
// 					if(err)
// 						console.log(err);
// 					else
// 						callback(null,result,userTokenInfo);
// 				});
// 			},
// 			function(userInfo,userTokenInfo,callback){
// 				bcrypt.hashPwCompare(req.body.userPwd,userInfo.userPwd,function(err,isMatch){
// 					if(err)
// 						console.log(err);
// 					else
// 						callback(null,userTokenInfo,isMatch);
// 				});
// 			},
// 			function(userTokenInfo,isMatch,callback){
// 				if(isMatch==1){
// 					var changePwd=bcrypt.hashPw(req.body.userNewPwd);
// 					UserController.updateUserPwd(userTokenInfo.ObjectId,changePwd,function(err,result){
// 						console.log(result);
// 						if(err)
// 							console.log(err)
// 						else if(result.nModified==1)
// 							callback(null,userTokenInfo,result);
// 						else
// 							callback(null,userTokenInfo,result);
// 					});
// 				}
// 				else
// 					callback(null,userTokenInfo,0);
// 			}
// 		],function(err,userTokenInfo,userPwdChangeResult){
// 			console.log(userTokenInfo);
// 			if(err)
// 				console.log(err);
// 			else if(userTokenInfo.userToken==0){
// 				output.msg="success";
// 				output.data={
// 					msg:"토근값없음"
// 				}
// 				res.json(output);
// 			}
// 			else if(userPwdChangeResult==1){
// 				output.msg="success";
// 				output.data={
// 					msg:"비밀번호바꾸기 성공",
// 					userToken:userTokenInfo.userToken
// 				}
// 				res.json(output);
// 			}
// 			else{
// 				output.msg="success";
// 				output.data={
// 					msg:"비밀번호 에러",
// 					userToken:userTokenInfo.userToken
// 				}
// 				res.json(output);
// 			}
// 		});
// }




//수정완료
//유저이름 변경
// exports.changeUserName=function(req,res,next){
// 	async.waterfall([
// 			function(callback){
// 				jsonWebToken.TokenCheck(req.body.userToken,function(err,result){
// 					if(err)
// 						console.log(err);
// 					else
// 						callback(null,result);
// 				});
// 			},
// 			function(userTokenInfo,callback){
// 				UserController.updateUserName(userTokenInfo.ObjectId,req.body.userChangeName,function(err,result){
// 					if(err)
// 						console.log(err);
// 					else if(result==1)
// 						callback(null,userTokenInfo,result);
// 					else
// 						callback(null,userTokenInfo,result);
// 				});
// 			}
// 		],function(err,userTokenInfo,userNameChnageResult){
// 			if(err)
// 				console.log(err)
// 			else if(userNameChnageResult==1){
// 				output.msg="success";
// 				output.data="닉네임바꾸기 성공";
// 				output.data={
// 					msg:"닉네임바꾸기성공",
// 					userToken:userTokenInfo.userToken
// 				}
// 				res.json(output)
// 			}
// 			else{
// 				output.msg="success";
// 				output.data="닉네임 바꾸기 실패"
// 				res.json(output);
// 			}
// 		})
// }



//수정완료
//유저나이 변경
// exports.changeUserAge=function(req,res,next){
// 	async.waterfall([
// 			function(callback){
// 				jsonWebToken.TokenCheck(req.body.userToken,function(err,result){
// 					if(err)
// 						console.log(err);
// 					else
// 						callback(null,result);
// 				});
// 			},
// 			function(userTokenInfo,callback){
// 				UserController.updateUserAge(userTokenInfo.ObjectId,req.body.userChangeAge,function(err,result){
// 					if(err)
// 						console.log(err);
// 					else if(result==1)
// 						callback(null,userTokenInfo,result);
// 					else
// 						callback(null,userTokenInfo,result);
// 				});
// 			}
// 		],function(err,userTokenInfo,userAgeChangeResult){
// 			if(err)
// 				console.log(err);
// 			else if(userAgeChangeResult==1){
// 				output.msg="success";
// 				output.data={
// 					msg:"나이바꾸기 성공",
// 					userToken:userTokenInfo.userToken
// 				}
// 				res.json(output);
// 			}
// 			else{
// 				output.msg="success";
// 				output.data="나이바꾸기 실패";
// 				res.json(output);
// 			}
// 		})
// }

//수정완료
//유저지역 변경
// exports.changeUserLocation=function(req,res,next){
// 	async.waterfall([
// 			function(callback){
// 				jsonWebToken.TokenCheck(req.body.userToken,function(err,result){
// 					if(err)
// 						console.log(err);
// 					else
// 						callback(null,result);
// 				});
// 			},
// 			function(userTokenInfo,callback){
// 				UserController.UpdateUserLocation(userTokenInfo.ObjectId,req.body.userChangeLocation,function(err,result){
// 					if(err)
// 						console.log(err);
// 					else if(result==1)
// 						callback(null,userTokenInfo,result);
// 					else
// 						callback(null,userTokenInfo,result);
// 				});
// 			}
// 		],function(err,userTokenInfo,userLocationChangeResult){
// 			if(err)
// 				console.log(err);
// 			else if(userLocationChangeResult==1){
// 				output.msg="success";
// 				output.data={
// 					msg:"지역바꾸기 성공",
// 					userToken:userTokenInfo.userToken
// 				}
// 				res.json(output);
// 			}
// 			else{
// 				output.msg="success";
// 				output.data="지역바꾸기 실패";
// 				res.json(output);
// 			}
// 		})
// }
//수정완료
//프로필 사진 변경
exports.changeUserPhoto=function(req,res,next){
	async.waterfall([
			function(callback){
				jsonWebToken.TokenCheck(req.body.userToken,function(err,result){
					if(err)
						console.log(err);
					else
						callback(null,result);
				});
			},
			function(userTokenInfo,callback){
				UserController.getUserFindObjectId(userTokenInfo.ObjectId,function(err,result){
					if(err)
						console.log(err);
					else
						callback(null,result,userTokenInfo);
				});				
			},
			function(userInfo,userTokenInfo,callback){
				var PhotoFile=req.files;
				var changePhoto=config.Customer.imageurl+'/uploads/'+PhotoFile[0].fieldname+'/'+PhotoFile[0].filename;
				var strArray=userInfo.userPhoto.split('/');
				var ImageUrl='public/'+strArray[3]+'/'+strArray[4]+'/'+strArray[5];
				if(strArray[5]=='default_image.png'){
					UserController.updateUserPhoto(userTokenInfo.ObjectId,changePhoto,function(err,result){
						if(err)
							console.log(err);
						else if(result==1)
							callback(null,userTokenInfo,result);
						else
							callback(null,userTokenInfo,result);
					});
				}
				else{
					fs.unlink(ImageUrl,function(err){
						if(err)
							console.log(err);
					});
					UserController.updateUserPhoto(userTokenInfo.ObjectId,changePhoto,function(err,result){
						if(err)
							console.log(err);
						else if(result==1)
							callback(null,userTokenInfo,result);
						else
							callback(null,userTokenInfo,result);
					});
				}
			}
				
		],function(err,userTokenInfo,userPhotoChangeResult){
			if(err)
				console.log(err);
			else if(userPhotoChangeResult==1){
				output.msg="success";
				output.data={
					msg:"수정성공",
					userToken:userTokenInfo.userToken
				}
				res.json(output);
			}
			else{
				output.msg="success";
				output.data="수정실패";
				res.json(output);
			}
		});
}
//수정완료
//기본 이미지로 설정
exports.basicUserPhoto=function(req,res,next){
	async.waterfall([
			function(callback){
				jsonWebToken.TokenCheck(req.body.userToken,function(err,result){
					if(err)
						console.log(err);
					else
						callback(null,result);
				});
			},
			function(userTokenInfo,callback){
				UserController.getUserFindObjectId(userTokenInfo.ObjectId,function(err,result){
					if(err)
						console.log(err);
					else
						callback(null,result,userTokenInfo);
				});
			},
			function(userInfo,userTokenInfo,callback){
				var strArray=userInfo.userPhoto.split('/');
				var ImageUrl='public/'+strArray[3]+'/'+strArray[4]+'/'+strArray[5];
				var changePhoto=config.Customer.imageurl+'/uploads/userPhoto/default_image.png';
				if(strArray[5]=='default_image.png')
					callback(null,userTokenInfo,2);
				else{
					fs.unlink(ImageUrl,function(err){
						if(err)
							console.log(err);
					});
					UserController.updateUserPhoto(userTokenInfo.ObjectId,changePhoto,function(err,result){
						if(err)
							console.log(err);
						else if(result==1)
							callback(null,userTokenInfo,result);
						else
							callback(null,userTokenInfo,result);
					});
				}
			}
		],function(err,userTokenInfo,userPhotoChangeResult){
			if(err)
				console.log(err);
			else if(userPhotoChangeResult==1){
				output.msg="success";
				output.data={
					msg:"수정성공",
					userToken:userTokenInfo.userToken
				}
				res.json(output);
			}
			else if(userPhotoChangeResult==2){
				output.msg="success";
				output.data={
					msg:"기본이미지입니다",
					userToken:userInfo.userToken
				}
				res.json(output);
			}
			else{
				output.msg="success";
				output.data={
					msg:"수정실패"
				}
			}
		});
}
//유저이름 변경
exports.pushOnOff = async function(req,res,next) {
	let userToken = await jsonWebToken.TokenCheck(req.body.userToken);
	let userIdCheckdata = { _id: userToken.ObjectId };
	let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
	let pushOnOff = req.body.pushOnOff;
	let updateUserPushOnOffData = {"$set":{"userPushOnOff":pushOnOff}};
	let updateUserPushOnOff = await UserController.updateUserInfo(userIdCheckdata,updateUserPushOnOffData);
	output.msg = "success";
	output.data = {
		userToken: userToken.userToken,
		msg: "pushOnOff 설정완료"
	}
	res.json(output);
}
//수정완료
//푸시설정
// exports.pushOnOff=function(req,res,next){
// 	async.waterfall([
// 			function(callback){
// 				jsonWebToken.TokenCheck(req.body.userToken,function(err,result){
// 					if(err)
// 						console.log(err);
// 					else
// 						callback(null,result);
// 				});
// 			},
// 			function(userTokenInfo,callback){
// 				UserController.updateUserPushOnOff(userTokenInfo.ObjectId,req.body.pushOnOff,function(err,result){
// 					if(err)
// 						console.log(err);
// 					else if(result==1)
// 						callback(null,userTokenInfo,result);
// 					else
// 						callback(null,userTokenInfo,result);
// 				})
// 			}
// 		],function(err,userTokenInfo,updateUserPushOnOffResult){
// 			if(err)
// 				console.log(err);
// 			else if(updateUserPushOnOffResult==1){
// 				output.msg="success";
// 				output.data={
// 					msg:"수정완료",
// 					userToken:userTokenInfo.userToken,
// 					pushOnOff:req.body.pushOnOff
// 				}
// 				res.json(output);
// 			}
// 			else{
// 				output.msg="success";
// 				output.data={
// 					msg:"수정실패"
// 				}
// 				res.json(output);
// 			}
// 		});
// }




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

// exports.success=function(req,res,next){
// 	output.data={
// 		test:"성공"
// 	}
// 	res.json(output);
// }
//게시판내글보기
exports.boardMyPost=function(req,res,next){
	
}



exports.facebookLogin=passport.authenticate('facebook',{scope:['public_profile','email']});
exports.facebookcallback=passport.authenticate('facebook',{successRedirect:'/success',failureRedirect:'/fail'});
exports.googleLogin=passport.authenticate('google',{scope:['https://www.googleapis.com/auth/plus.login',
														   'https://www.googleapis.com/auth/plus.profile.emails.read']});
exports.googlecallback=passport.authenticate('google',{successRedirect:'/success',failureRedirect:'/fail'});