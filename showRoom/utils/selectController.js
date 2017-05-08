const SelectBoard=require('../model/Selectdb');
const moment=require('moment');
moment.locale("ko");
exports.saveSelectBoard=function(select,callback){
	select.save(function(err,result){
		if(err)
			console.log(err);
		else if(result==null)
			callback(null,0);
		else
			callback(null,result);
	});
}
exports.detailSelectBoard=function(selectId,callback){
	SelectBoard.findOne({_id:selectId},function(err,result){
		if(err)
			console.log(err);
		else if(result==null)
			callback(null,0);
		else
			callback(null,result);
	});
}
exports.listSelectBoard=function(userId,callback){
	SelectBoard.find({selectboardSelectUsers:{$ne:userId},selectboardExit:true},function(err,result){
		if(err)
			console.log(err);
		else if(result==0)
			callback(null,0);
		else
			callback(null,result);
	});
}
exports.dateListSelectBoard=function(userId,callback){
	SelectBoard.find({selectboardUserId:userId,selectboardExit:true}).sort({"selectboardDatetime":1}).exec(function(err,result){
		if(err)
			console.log(err);
		else if(result==0)
			callback(null,0);
		else{
			var resultLength=Object.keys(result).length;
			if(resultLength==6){
				result[0].selectboardExit=!result[0].selectboardExit;
				result[0].save();
				callback(null,1);
			}
			else
				callback(null,1);
		}
	});	
}
exports.stopSelectBoard=function(selectId,callback){
	SelectBoard.findOne({_id:selectId},function(err,result){
		console.log(result);
		if(err)
			console.log(err);
		else if(result==null)
			callback(null,0);
		else{
			result.selectboardExit=!result.selectboardExit;
			result.save();
			callback(null,result);
		}
	});
}
exports.boteSelectBoard=function(selectId,bote,user,callback){
	if(bote==0){
		SelectBoard.update({_id:selectId},{"$push":{selectboardSelectUsers:user.userId,selectboardLeftLike:user.userAge}},function(err,result){
			if(err)
				console.log(err);
			else if(result.nModified==1)
				callback(null,1);
			else
				callback(null,0);
		});
	}
	else{
		SelectBoard.update({_id:selectId},{"$push":{selectboardSelectUsers:user.userId,selectboardRightLike:user.userAge}},function(err,result){
			if(err)
				console.log(err);
			else if(result.nModified==1)
				callback(null,1);
			else
				callback(null,0);
		});
	}
}
exports.deleteTimeSelectBoard=function(selectId,deleteTime,callback){
	SelectBoard.findOne({_id:selectId},function(err,result){
		if(err)
			console.log(err);
		else if(result==null)
			callback(null,0);
		else{
			result.selectboardDelete=deleteTime;
			result.selectboardExit=false;
			result.save();
			callback(null,result);
		}
	});
}
exports.deleteListSelectBoard=function(deleteTime,callback){
	SelectBoard.find({selectboardDelete:deleteTime},function(err,result){
		if(err)
			console.log(err);
		else if(result==0)
			callback(null,0);
		else
			callback(null,result);
	});
}
exports.deleteSelectBoard=function(selectId,callback){
	SelectBoard.remove({_id:selectId},function(err,result){
		if(err)
			console.log(err);
		else
			callback(null,"성공");
	});
}
