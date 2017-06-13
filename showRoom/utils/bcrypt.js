var bcrypt=require('bcrypt-nodejs');
const saltRounds=4;
var salt = bcrypt.genSaltSync(saltRounds);
exports.hashPw=function(userPw){
	var hashuserPw=bcrypt.hashSync(userPw);
	return hashuserPw;
}
// exports.hashPwCompare=function(userPw,dbuserPw,callback){
// 	if(dbuserPw==undefined){
// 		callback(null,0);
// 	}
// 	else{
// 		bcrypt.compare(userPw,dbuserPw,function(err,result){
// 			if(err)
// 				console.log(err);
// 			else
// 				callback(null,result);
// 		});
// 	}
// }

exports.hashPwCompare = function(userPw,dbuserPw){
	return new Promise((resolve, reject) => {
		bcrypt.compare(userPw,dbuserPw,(err, result) => {
			if(err)
				reject(new Error("err"));
			else if(result == false)
				reject(new Error("userPw is not equal"));
			else
				resolve(result);
		});
	});
}


exports.userSecretToken=function(ObjectId){
	var hash=bcrypt.hashSync(ObjectId,salt);
	return hash;
}