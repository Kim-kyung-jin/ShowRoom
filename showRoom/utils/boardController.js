const Board=require('../model/Boarddb');
const User=require('../model/Userdb');

exports.aggregateBoard = function(data) {
	return new Promise(function(resolve, reject) {
		Board.aggregate(data,function(err, result) {
			if(err)
				reject(new Error("err"));
			else
				resolve(result);
		});
	});
}
exports.updateBoard = function(data, setdata) {
	return new Promise(function(resolve, reject){
		Board.update(data, setdata,function(err,result){
			if(err)
				reject(new Error("err"));
			else if(result.nModified == 1)
				resolve(result);
			else
				reject(new Error("board is not update"));
		});
	});
}
exports.findOneBoard = function(data) {
	return new Promise(function(resolve, reject) {
		Board.findOne(data,function(err, result){
			if(err)
				reject(new Error("err"));
			else if(result == null)
				reject(new Error("boardData is not"));
			else
				resolve(result);
		});
	});	
}




exports.saveBoard = function(board) {
	return new Promise(function(resolve, reject) {
		board.save(function(err, result) {
			if(err)
				reject(new Error("save err"));
			else
				resolve(result);
		});
	});
}
exports.findOneBoardComment = function(data,setdata,userId) {
	return new Promise(function(resolve, reject) {
		Board.findOne(data,setdata,function(err, result) {
			if(err)
				reject(new Error("err"));
			else if(result.boardComments[0].boardCommentsUserId != userId)
				reject(new Error("boardCommentsUserId is not equal"));
			else
				resolve(result.boardComments[0]);
		});
	});
}
exports.sortListBoard = function(data,sortdata) {
	return new Promise(function(resolve, reject) {
		Board.find(data).sort(sortdata).exec(function(err,result) {
			if(err)
				reject(new Error("err"));
			else if(result[0] != null)
				resolve(result);
			else 
				reject(new Error("err"));
		});
	});
}
exports.todayCountreset = function(setdata) {
	return new Promise(function(resolve, reject) {
		Board.update({},setdata,{multi:true},function(err,result) {
			console.log(result);
			if(err)
				reject(new Error("err"));
			else
				resolve(result);
		});
	});
}

exports.removeBoard = function(data) {
	let ImageUrl = [];
	return new Promise(function(resolve, reject) {
		Board.find(function(err,results) {
			if(err)
				reject(new Error("err"));
			else if(results == null)
				resolve(ImageUrl);
			else{
				results.forEach(function(result) {
					let strary = result.boardPhotoKey.split('/');
					let thumbnaildelete = 'thumbnail/'+strary[1]+'/'+strary[2]+'/'+strary[3];
					ImageUrl.push(result.boardPhotoKey);
					ImageUrl.push(thumbnaildelete);
					result.remove();
				});
				resolve(ImageUrl);
			}
		});
	});
}

exports.abc = function(data, setdata) {
	return new Promise(function(resolve, reject) {
		Board.update(data, setdata, {"multi": true},function(err,result) {
			if(err)
				return console.log(err);
			else
				return console.log(result);
		});
	});
}
exports.boardJoin = function(){
	return new Promise(function(resolve, reject) {
		console.log("asd");
		Board.aggregate([{
			"$lookup":{
				from: "users",
				localField: "boardUserId",
				foreignField: "userId",
				as: "boardabc"
			}},
			{ "$project": {
				"boardUserId": 1,
				"boardUserPhoto": "$boardabc.userPhoto"
			}}
		],function(err,result){
			return console.log(result);
		});
	})
}
// //전체체크
// // o.map=function(){
// // 	emit(this.boardUserId,this.boardAge.length);
// // }

// //10대 체크
// var o={};
// o.map=function(){
// 	for(index in this.boardAge){
// 		if(this.boardAge[index]>13 && this.boardAge[index]<15)
// 			emit(this.boardUserId,1);
// 	}
// };
// o.reduce=function(k,vals){
// 	return Array.sum(vals);
// };

// o.out={replace:'boardtotal'}
// o.verbose=true;

// //mapreduce
// exports.example123=function(callback){
// 	Board.mapReduce(o,function(err,model,result){
// 		model.aggregate({
// 			"$project":{
// 				"_id":0,
// 				"boardUserId":"$_id",
// 				"boardClick":"$value"
// 			}
// 		},{"$sort":{boardClick:-1}},function(err,docs){
// 			console.log(docs);
// 		});
// 	});
// }








