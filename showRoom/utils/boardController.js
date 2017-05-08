const Board=require('../model/Boarddb');
const ObjectId = require('mongodb').ObjectID;	
exports.getBoardFindAll=function(callback){
	Board.find({boardOnOff:true},function(err,result){
		if(err)
			console.log(err);
		else if(result==0)
			callback(null,0);
		else
			callback(null,result);
	});
}


exports.getBoardFindListPaging=function(userId,page,callback){
//	return console.log(userId);
	var limit=10;
	var skip=(page-1)*limit;
	Board.aggregate(
			[{"$project":
				{boardUserId:1,
				boardUserName:1,
				boardPhoto:1,
				boardDatetime:1,
				boardContent:1,
				boardComments:1,
				boardOnOff:1,
				boardLikeCount:{"$size":"$boardLikeUsers"},
				boardCommentsCount:{"$size":"$boardComments"},
				boardIsLike:{"$in":[userId,"$boardLikeUsers"]}}},
				{"$match":{"boardOnOff":true}},
				{"$skip":skip},
				{"$limit":limit}
			],
			function(err,result){
				if(err)
					console.log(err);
				else if(result==null)
					callback(null,0);
				else
					callback(null,result);
			}
		);
}


exports.saveBoard=function(board,callback){
	board.save(function(err,result){
		if(err)
			console.log(err);
		else
			callback(null,result);
	});
}


exports.detailFindboard=function(boardId,userId,callback){
	var bId = ObjectId(boardId);
	Board.aggregate([{
		"$project":{
			boardUserId:1,
			boardUserName:1,
			boardPhoto:1,
			boardDatetime:1,
			boardContent:1,
			boardComments:1,
			boardOnOff:1,
			boardLikeCount:{"$size":"$boardLikeUsers"},
			boardCommentsCount:{"$size":"$boardComments"},
			boardIsLike:{"$in":[userId,"$boardLikeUsers"]}}},
			{ $match :{ _id : bId }},
	
	],function(err,result){
		if(err)
			console.log(err);
		else if(result==null)
			callback(null,0);
		else
			callback(null,result);
	});
}
//전체체크
// o.map=function(){
// 	emit(this.boardUserId,this.boardAge.length);
// }

//10대 체크
var o={};
o.map=function(){
	for(index in this.boardAge){
		if(this.boardAge[index]>13 && this.boardAge[index]<15)
			emit(this.boardUserId,1);
	}
};
o.reduce=function(k,vals){
	return Array.sum(vals);
};

o.out={replace:'boardtotal'}
o.verbose=true;

//mapreduce
exports.example123=function(callback){
	Board.mapReduce(o,function(err,model,result){
		model.aggregate({
			"$project":{
				"_id":0,
				"boardUserId":"$_id",
				"boardClick":"$value"
			}
		},{"$sort":{boardClick:-1}},function(err,docs){
			console.log(docs);
		});
	});
}

exports.updateBoardPhoto=function(boardId,changePhoto,callback){
	var bId = ObjectId(boardId);
	Board.update({_id:bId},{"$set":{"boardPhoto":changePhoto}},function(err,result){
		if(err)
			console.log(err);
		else if(result.nModified==1)
			callback(null,1);
		else
			callback(null,0);
	});
}


exports.updateBoardContent=function(boardId,changeContent,callback){
	var bId = ObjectId(boardId);
	Board.update({_id:bId},{"$set":{"boardContent":changeContent}},function(err,result){
		console.log(result);
		if(err)
			console.log(err);
		else if(result.nModified==1)
			callback(null,1);
		else
			callback(null,0);
	});
}


exports.updateBoardAll=function(boardId,changePhoto,changeContent,callback){
	var bId = ObjectId(boardId);
	Board.update({_id:bId},{"$set":{"boardPhoto":changePhoto,"boardContent":changeContent}},function(err,result){
		if(err)
			console.log(err);
		else if(result.nModified==1)
			callback(null,1);
		else
			callback(null,0);
	});
}


exports.removeBoard=function(boardId,callback){
	Board.findOne({_id:boardId},function(err,result){
		console.log(boardId);
		if(err)
			console.log(err);
		else if(result==null)
			callback(null,0);
		else{
			result.boardOnOff=!result.boardOnOff;
			result.save();
			callback(null,1);
		}
	});
}


exports.addBoardComment=function(boardId,comment,callback){
	Board.update({_id:boardId},{"$push":{boardComments:comment}},function(err,result){
		if(err)
			console.log(err);
		else if(result.nModified==1)
			callback(null,1);
		else
			callback(null,0);
	});
}


exports.findBoardComment=function(boardId,commentId,callback){
	Board.findOne({_id:boardId},{boardComments:{"$elemMatch":{_id:commentId}}},function(err,result){
		if(err)
			console.log(err);
		else if(result==null)
			callback(null,0);
		else
			callback(null,result);
	});
}


exports.editBoardComment=function(boardId,commentId,comment,callback){
	Board.update({_id:boardId,"boardComments._id":commentId},{"$set":{"boardComments.$":comment}},function(err,result){
		if(err)
			console.log(err);
		else if(result.nModified==1)
			callback(null,1);
		else
			callback(null,0);
	});
}


exports.deleteBoardComment=function(boardId,commentId,callback){
	Board.update({_id:boardId},{"$pull":{boardComments:{_id:commentId}}},function(err,result){
		if(err)
			console.log(err);
		else if(result.nModified==1)
			callback(null,1);
		else
			callback(null,0);
	});
}


exports.likeBoardtrue=function(boardId,userId,callback){
	Board.update({_id:boardId},{"$push":{"boardLikeUsers":userId}},function(err,result){
		if(err)
			console.log(err);
		else if(result.nModified==1)
			callback(null,1);
		else
			callback(null,0);
	});
}


exports.likeBoardfalse=function(boardId,userId,callback){
	Board.update({_id:boardId},{"$pull":{"boardLikeUsers":userId}},function(err,result){
		if(err)
			console.log(err);
		else if(result.nModified==1)
			callback(null,1);
		else
			callback(null,0);
	});
}


exports.getboardTodayCountPlus=function(boardId,callback){
	Board.findOne({_id:boardId},function(err,result){
		if(err)
			console.log(err);
		else if(result==null)
			callback(null,0);
		else{
			result.boardTodayCount++;
			result.save();
			callback(null,result);
		}
	});
}


exports.getboardTodayCountMinus=function(boardId,callback){
	Board.findOne({_id:boardId},function(err,result){
		if(err)
			console.log(err);
		else if(result==null)
			callback(null,0);
		else{
			if(result.boardTodayCount==0)
				callback(null,result);
			else{
				result.boardTodayCount--;
				result.save();
				callback(null,result);
			}
		}
	});
}


exports.getboardTodayBestUserCodyList=function(callback){
	Board.find({boardBestDate:{"$exists":false}}).sort({"boardTodayCount":-1}).exec(function(err,result){
		if(err)
			console.log(err);
		else if(result==0)
			callback(null,0);
		else
			callback(null,result);
	});
}


exports.getboardTodayBestUserCodyChoise=function(boardId,todayDate,callback){
	Board.update({_id:boardId},{"$set":{"boardBestDate":todayDate}},function(err,result){
		if(err)
			console.log(err);
		else if(result.nModified==1)
			callback(null,1);
		else
			callback(null,0);
	});
}


exports.getboardPastUserCody=function(callback){
	Board.find({boardBestDate:{"$exists":true}}).sort({"boardBestDate":-1}).exec(function(err,result){
		if(err)
			console.log(err);
		else if(result==0)
			callback(null,0);
		else
			callback(null,result);
	});
}