
const config=require('config');
const fs=require('fs');
const moment=require('moment');

const ObjectId = require('mongodb').ObjectID;	
const mkdirp = require('mkdirp');
const path=require('path');
const randomstring =require('randomstring');
const multer = require('../utils/multers3.js');
const BoardController=require('../utils/boardController.js')
	  ,UserController=require('../utils/userController.js')
	  ,Board=require('../model/Boarddb');
const jsonWebToken=require('../utils/jsonWebToken');
const AWS=require('aws-sdk');
AWS.config.region = config.Customer.AWSInfo.region;
AWS.config.accessKeyId = config.Customer.AWSInfo.accessKeyId;
AWS.config.secretAccessKey = config.Customer.AWSInfo.secretAccessKey;
var s3=new AWS.S3();

moment.locale("ko");

var output=new Object();



// exports.example=function(req,res,next){
// 	var board=new Board();
// 	board.boardUserId=req.body.userId;
// 	board.boardAge=req.body.userAge;
// 	board.save();
// }

// exports.example1=function(req,res,next){
// 	Board.update({_id:req.body.boardId},{"$push":{"boardAge":req.body.userAge}},function(err,result){
		
// 	});
// }
// exports.example2=function(req,res,next){
// 	BoardController.example123(function(err,result){
// 		console.log(result);
// 	});

// }
exports.joinexample = async function(req,res,next){
	let userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
	let userIdCheckdata = { _id: userToken.ObjectId };
	let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
	let abcd = await BoardController.boardJoin();
}





//리스트보기
exports.listBoard = async function(req, res, next) {
	let userTokenCheck = req.headers.usertoken;
	let limit = 10;
	let skip = (req.params.page - 1) * limit;
	let userToken,userIdCheckdata,userInfo,boardListquery,boardListResult;
	if(userTokenCheck == 'guest') {
		boardListquery = [{"$project":{
								boardUserName: 1,
								boardPhoto: 1,
								boardDatetime: 1,
								boardContent: 1,
								boardOnOff: 1,
								boardName: 1,
								boardLikeCount: {"$size": "$boardLikeUsers"},
								boardCommentsCount: {"$size": "$boardComments"},
								boardIsLike: {"$in": ['guest', "$boardLikeUsers"]}}},
								{"$match": {"boardOnOff": true}},
								{"$skip": skip},
								{"$limit": limit}];
		boardListResult = await BoardController.aggregateBoard(boardListquery);
		output.msg="success";
		output.data = boardListResult;
		
		res.setHeader('userToken','guest');
	}
	else if(userTokenCheck == undefined) {
		output.msg="success";
		res.setHeader('userToken','guest');
	}
	else if(userTokenCheck == null) {
		output.msg="success";
		res.setHeader('userToken','guest');
	}
	else{
		userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
	 	userIdCheckdata = { _id: userToken.ObjectId };
	 	userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
	 	
	 	boardListquery = [{"$project":{
								boardUserName: 1,
								boardPhoto: 1,
								boardDatetime: 1,
								boardContent: 1,
								boardName: 1,
								boardOnOff: 1,
								boardLikeCount: {"$size": "$boardLikeUsers"},
								boardCommentsCount: {"$size": "$boardComments"},
								boardUserPhoto: userInfo.userPhoto,
								boardIsLike: {"$in": [userInfo.userId, "$boardLikeUsers"]}}},
								{"$match": {"boardOnOff": true}},
								{"$skip": skip},
								{"$limit": limit}];
		boardListResult = await BoardController.aggregateBoard(boardListquery);

		output.msg="success";
		output.data = boardListResult;
		
		res.setHeader('userToken',userToken.userToken);
	}
	res.json(output);
}

//게시판 등록
exports.addBoard = async function(req, res, next) {
	let userTokenCheck = req.headers.usertoken;
	if(userTokenCheck == 'guest'){
		output.msg = "fail";
		res.setHeader('userToken', 'guest');
	}
	else if(userTokenCheck == undefined) {
		output.msg="fail";
		res.setHeader('userToken','guest');
	}
	else if(userTokenCheck == null) {
		output.msg="fail";
		res.setHeader('userToken','guest');
	}
	else {
		let userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
		let userIdCheckdata = { _id: userToken.ObjectId };
		let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
		let board = new Board();


		board.boardUserId = userInfo.userId;
		//board.boardUserName = userInfo.userName;
		board.boardName = req.body.boardName;
		board.boardPhoto = req.file.transforms[0].location;
		board.boardContent = req.body.boardContent;
		board.boardDatetime = new moment().format("YYYY-MM-DD HH:mm:ss"); 
		board.boardPhotoKey = req.file.transforms[0].key;
		//board.boardUserPhoto = userInfo.userPhoto;
		let saveBoardResult = await BoardController.saveBoard(board);
		output.msg = "success";
		//output.data = saveBoardResult;
		res.setHeader('userToken',userToken.userToken);
	}
	res.json(output);
}
//게시판 상세보기
exports.detailBoard = async function(req,res,next) {
	let userTokenCheck = req.headers.usertoken;
	let boardDetailquery;
	if(userTokenCheck == 'guest'){
		boardDetailquery = [{"$project": {
								boardUserName: 1,
								boardPhoto: 1,
								boardDatetime: 1,
								boardContent: 1,
								boardComments: 1,
								boardOnOff: 1,
								boardComments: 1,
								boardLikeCount: {"$size": "$boardLikeUsers"},
								boardCommentsCount: {"$size": "$boardComments"},
								boardIsLike: {"$in": ["guest", "$boardLikeUsers"]}}},
								{ "$match": { _id: ObjectId(req.params.boardId)}}
		];
		boardDetailResult = await BoardController.aggregateBoard(boardDetailquery);
		let boardDetailResultObject = boardDetailResult[0];
		output.msg="success";
		output.data = boardDetailResultObject;
		
		res.setHeader('userToken', 'guest');
	}
	else if(userTokenCheck == undefined) {
		output.msg="success";
		res.setHeader('userToken','guest');
	}
	else if(userTokenCheck == null) {
		output.msg="success";
		res.setHeader('userToken','guest');
	}
	else {
		let userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
		let userIdCheckdata = { _id: userToken.ObjectId };
		let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
		boardDetailquery = [{"$project": {
									boardUserName: 1,
									boardPhoto: 1,
									boardDatetime: 1,
									boardContent: 1,
									boardComments: 1,
									boardOnOff: 1,
									boardComments:1,
									boardName: 1,
									boardLikeCount: {"$size": "$boardLikeUsers"},
									boardCommentsCount: {"$size": "$boardComments"},
									boardUserPhoto: userInfo.userPhoto,
									boardIsLike: {"$in": [userInfo.userId, "$boardLikeUsers"]}}},
									{ "$match": { _id: ObjectId(req.params.boardId)}}
		];
		let boardDetailResult = await BoardController.aggregateBoard(boardDetailquery);
		let boardDetailResultObject = boardDetailResult[0];
		output.msg="success";
		output.data = boardDetailResultObject
		
		res.setHeader('userToken',userToken.userToken);
	}
	
	res.json(output);
}

//게시물 수정
exports.editBoard = async function(req,res,next) {
	let userTokenCheck = req.headers.usertoken;
	if(userTokenCheck == 'guest'){
		output.msg = "fail";
		res.setHeader('userToken', 'guest');
	}
	else if(userTokenCheck == undefined) {
		output.msg="success";
		res.setHeader('userToken','guest');
	}
	else if(userTokenCheck == null) {
		output.msg="success";
		res.setHeader('userToken','guest');
	}
	else {
		let userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
		let userIdCheckdata = { _id: userToken.ObjectId };
		let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
		
		if(req.file) {
			let changePhoto = req.file.location;
			let changeKey = req.file.key;
			let saveDay=new moment().format("YYYY-MM-DD");
			let boardUpdateSetquery = '';
			let deletePhoto = [];
			if(req.body.boardContent)
				boardUpdateSetquery = {"$set": {"boardPhoto": changePhoto, "boardPhotoKey": changeKey, "boardContent": req.body.boardContent}};
			else
				boardUpdateSetquery = {"$set": {"boardPhoto": changePhoto, "boardPhotoKey": changeKey}};
			let boardDetailquery = {_id: ObjectId(req.params.boardId)};
			let boardDetail = await BoardController.findOneBoard(boardDetailquery);
			deletePhoto.push({Key: boardDetail.boardPhotoKey});
			await multer.deleteFile(deletePhoto);
			
			let boardPhotoUpdate = await BoardController.updateBoard(boardDetailquery, boardUpdateSetquery);
			output.msg = "success";
			output.data = {
				result: "Update success"
			}
		}
		else {
			let boardUpdatequery = {_id: ObjectId(req.params.boardId)};
			let boardUpdateSetquery = {"$set": {"boardContent": req.body.boardContent}};
			let boardContentUpdate = await BoardController.updateBoard(boardUpdatequery,boardUpdateSetquery);
			output.msg = "success";
			output.data = {
				result: "Update success"
			} 
		}
		res.setHeader('userToken',userToken.userToken);
	}
	res.json(output);
}
//게시판삭제
exports.deleteBoard = async function(req,res,next) {
	let userTokenCheck = req.headers.usertoken;
	if(userTokenCheck == 'guest'){
		output.msg = "fail";
		res.setHeader('userToken', 'guest');
	}
	else if(userTokenCheck == undefined) {
		output.msg="success";
		res.setHeader('userToken','guest');
	}
	else if(userTokenCheck == null) {
		output.msg="success";
		res.setHeader('userToken','guest');
	}
	else {
		let userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
		let userIdCheckdata = { _id: userToken.ObjectId };
		let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
		let boardFindOnequery = {_id: ObjectId(req.params.boardId)};
		let boardInfo = await BoardController.findOneBoard(boardFindOnequery);
		let after_time=moment().add(30,'days');
		let times = after_time.format("YYYY-MM-DD");

		
		if(userInfo.userId == boardInfo.boardUserId){
			let removeBoardSetquery = {"$set": {"boardOnOff": false, "boardDeleteTime":times}};
			let removeBoard = await BoardController.updateBoard(boardFindOnequery,removeBoardSetquery);
			output.msg = "success";
			output.data = {
				result: "remove success"
			}
		}
		else{
			output.msg = "fail";
			output.data = {
				result:"Not remove"
			}
		}
		res.setHeader('userToken',userToken.userToken);
	}
	res.json(output);
}
//게시판 댓글 달기
exports.addComment = async function(req,res,next) {
	let userTokenCheck = req.headers.usertoken;
	if(userTokenCheck == 'guest'){
		output.msg = "fail";
		res.setHeader('userToken', 'guest');
	}
	else if(userTokenCheck == undefined) {
		output.msg="success";
		res.setHeader('userToken','guest');
	}
	else if(userTokenCheck == null) {
		output.msg="success";
		res.setHeader('userToken','guest');
	}
	else{
		let userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
		let userIdCheckdata = { _id: userToken.ObjectId };
		let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
		let comments = {
			boardCommentsUserId: userInfo.userId,
			boardCommentsUserName: userInfo.userName,
			boardCommentsUserPhoto: userInfo.userPhoto,
			boardCommentsContent: req.body.commentsContent,
			boardCommentsDatetime: new moment().format("YYYY-MM-DD HH:mm:ss")
		}
		let boardFindOnequery = {_id: ObjectId(req.params.boardId)};
		let boardCommentsSetquery = {"$push": {boardComments: comments}};
		let boardComments = await BoardController.updateBoard(boardFindOnequery, boardCommentsSetquery);
		output.msg = "success";
		res.setHeader('userToken',userToken.userToken);
	}
	res.json(output);
}
//게시판댓글수정
exports.editComment = async function(req,res,next) {
	let userTokenCheck = req.headers.usertoken;
	if(userTokenCheck == 'guest'){
		output.msg = "fail";
		res.setHeader('userToken', 'guest');
	}
	else if(userTokenCheck == undefined) {
		output.msg="fail";
		res.setHeader('userToken','guest');
	}
	else if(userTokenCheck == null) {
		output.msg="fail";
		res.setHeader('userToken','guest');
	}
	else {
		let userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
		let userIdCheckdata = { _id: userToken.ObjectId };
		let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
		let boardFindOnequery = {_id: ObjectId(req.params.boardId)};
		let boardIsMatchquery = {"boardComments": {"$elemMatch": {_id: ObjectId(req.params.commentId)}}};
		let boardIsMatch = await BoardController.findOneBoardComment(boardFindOnequery, boardIsMatchquery,userInfo.userId);
		
		let comment = {
			"_id":boardIsMatch._id,
			"boardCommentsUserId":userInfo.userId,
			"boardCommentsUserName":userInfo.userName,
			"boardCommentsContent":req.body.commentsContent,
			"boardCommentsUserPhoto": userInfo.userPhoto
		}
		let boardUpdatequery = {_id:ObjectId(req.params.boardId), "boardComments._id": ObjectId(req.params.commentId)};
		let boardUpdateSetquery = {"$set": {"boardComments.$": comment}};
		let boardUpdate = await BoardController.updateBoard(boardUpdatequery,boardUpdateSetquery);
		output.msg = "success";
		res.setHeader('userToken',userToken.userToken);
	}
	res.json(output);
}
//게시판댓글삭제
exports.deleteComment = async function(req,res,next) {
	let userTokenCheck = req.headers.usertoken;
	if(userTokenCheck == 'guest'){
		output.msg = "fail";
		res.setHeader('userToken', 'guest');
	}
	else if(userTokenCheck == undefined) {
		output.msg="fail";
		res.setHeader('userToken','guest');
	}
	else if(userTokenCheck == null) {
		output.msg="fail";
		res.setHeader('userToken','guest');
	}
	else {
		let userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
		let userIdCheckdata = { _id: userToken.ObjectId };
		let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
		let boardFindOnequery = {_id: ObjectId(req.params.boardId)};
		let boardIsMatchquery = {"boardComments": {"$elemMatch": {_id: ObjectId(req.params.commentId)}}};
		let boardIsMatch = await BoardController.findOneBoardComment(boardFindOnequery, boardIsMatchquery,userInfo.userId);
		let boardDeleteSetquery = {"$pull": {boardComments: {_id: Object(req.params.commentId)}}};
		let boardDelete = await BoardController.updateBoard(boardFindOnequery, boardDeleteSetquery);
		output.msg = "success";
		output.data = {
			result: "commentdelete success"
		}


		res.setHeader('userToken',userToken.userToken);
	}
	res.json(output);
}
//좋아요
exports.likePushPull = async function(req,res,next) {
	let userTokenCheck = req.headers.usertoken;
	if(userTokenCheck == 'guest'){
		output.msg = "fail";
		output.data = null;
		res.setHeader('userToken', 'guest');
	}
	else if(userTokenCheck == undefined) {
		output.msg="success";

		res.setHeader('userToken','guest');
	}
	else if(userTokenCheck == null) {
		output.msg="success";
		res.setHeader('userToken','guest');
	}
	else {
		let userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
		let userIdCheckdata = { _id: userToken.ObjectId };
		let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
		let boardFindOnequery = {_id: ObjectId(req.params.boardId)};
		if(req.body.boardLike == true) {
			let likeBoardtruequery = {"$push": {"boardLikeUsers": userInfo.userId}, "$inc": {boardTodayCount: 1}};
			let likeBoardtrue = await BoardController.updateBoard(boardFindOnequery,likeBoardtruequery);
		}
		else {
			let likeBoardfalsequery = {"$pull": {"boardLikeUsers": userInfo.userId}, "$inc": {boardTodayCount: -1}};
			let likeBoardfalse = await BoardController.updateBoard(boardFindOnequery, likeBoardfalsequery);
		}
		output.msg="success";
		output.data = null;
		res.setHeader('userToken',userToken.userToken);
	}
	res.json(output);
}
//오늘자 베스트게시물선정
exports.todayBestUserCody = async function() {
	let todayBestUserCodyquery = {boardBestDate:{"$exists":false}};
	let todayBestUserCodysort = {"boardTodayCount": -1};
	let todayBestUserCody = await BoardController.sortListBoard(todayBestUserCodyquery,todayBestUserCodysort);
	let current_time=new moment().format("YYYY-MM-DD");
	let todayBestUserCodyChoisequery = {_id:ObjectId(todayBestUserCody[0]._id)};
	let todayBestUserCodyChoiseset = {"$set": {"boardBestDate": current_time}};
	let todayBestUserCodyChoise = await BoardController.updateBoard(todayBestUserCodyChoisequery, todayBestUserCodyChoiseset);
	let resetset = {"$set": {"boardTodayCount": 0}};
	let resetBoardToday = await BoardController.todayCountreset(resetset); 
	return;
	
}
//역대 게시물
exports.pastUserCody = async function(req,res,next) {
	let pastCodyquery = {boardBestDate: {"$exists": true}};
	let pastCodysort = {"boardBestDate": -1};
	let pastCody = await BoardController.sortListBoard(pastCodyquery, pastCodysort);
	output.msg = "success";
	output.data = {
		result: pastCody
	}
	res.json(output);
}
//게시물 진짜삭제
exports.deleteBoardSche = async function() {
	let deletePhoto = [];
	//let after_time = moment().add(30, 'days');
	let dbdeletetime=new moment().format("YYYY-MM-DD");
	//let dbdeletetime = after_time.format("YYYY-MM-DD");
	let deleteBoardFind = {"boardDeleteTime": dbdeletetime};
	let deleteBoard = await BoardController.removeBoard(deleteBoardFind);
	for(let i=0; i<deleteBoard.length; i++)
		deletePhoto.push({Key: deleteBoard[i]});
	await multer.deleteFile(deletePhoto);
	console.log("삭제갯수 : " + deleteBoard.length);
	return;
}

